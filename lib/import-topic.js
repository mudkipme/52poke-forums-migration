const util = require('util');
const db = module.parent.parent.require('./src/database');
const mysqlDb = require('./db');
const User = module.parent.parent.require('./src/user');
const Topics = module.parent.parent.require('./src/topics');
const Posts = module.parent.parent.require('./src/posts');
const post = require('./post');
const defaultConfig = {};

class ImportTopic {
  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
  }

  async importAll() {
    let current = 0;
    let limit = 500;
    let finished = false;

    while (!finished) {
      const { rows } = await mysqlDb.query('SELECT * FROM {prefix}threads ORDER BY id LIMIT ?, ?', [current, limit]);
      if (rows.length === 0) {
        finished = true;
        break;
      }
      await this._importRows(rows);
      current += limit;
    }
  }

  async _importRows(rows) {
    for (let row of rows) {
      await this.importTopic(row);
    }
  }

  async importTopic(row) {
    const imported = await util.promisify(db.isSortedSetMember.bind(db))('_import:_topics', row.tid);
    if (imported) {
      console.log(`${row.tid} was already imported.`);
      return;
    }

    if (row.ttrash) {
      console.log(`Skip ${row.tid}. (In trash)`);
      return;
    }

    if (parseInt(row.other1) < 0) {
      console.log(`Skip ${row.tid}. (Point is lower than 0)`);
    }

    const cid = this.config.forumsMap[row.forumid];
    if (!cid) {
      console.log(`Skip ${row.tid}. (No corresponding category)`);
      return;
    }

    if (!row.authorid) {
      const { rows } = await mysqlDb.query('SELECT userid FROM {prefix}userlist WHERE username = ? LIMIT 1', [row.author]);
      if (rows.length > 0) {
        row.authorid = rows[0].userid;
      }
    }

    const userMeta = await util.promisify(db.getObject.bind(db))(`_import:_user:${row.authorid}`);
    if (!userMeta) {
      console.log(`Skip ${row.tid}. (Author ${row.authorid} not exists)`);
      return;
    }

    const isBanned = await util.promisify(User.isBanned)(userMeta.uid);
    if (isBanned) {
      console.log(`Skip ${row.tid}. (Author banned)`);
      return;
    }

    row.title = row.title.replace(/\\(.)/g, '$1');
    row.content = row.content.replace(/\\(.)/g, '$1');

    const title = post.formatTitle(row.title);
    const content = post.toMarkdown({
      id: row.id,
      tid: row.tid,
      content: row.content,
      upload: row.other3,
      hasRestrict: row.type === 1
    });

    const parameters = {
      uid: userMeta.uid,
      title,
      content,
      cid: cid,
      req: {
        ip: row.ip
      },
      timestamp: row.time * 1000
    };

    let topicData = null;
    let postData = null;

    try {
      const result = await util.promisify(Topics.post)(parameters);
      topicData = result.topicData;
      postData = result.postData;
    } catch (e) {
      if (e.message === '[[error:no-privileges]]') {
        console.log(`Skip ${row.tid}. (No privileges)`);
        return;
      }
      throw e;
    }

    if (row.other4) {
      // Edit info
      const editInfo = row.other4.split('%');
      if (editInfo.length >= 2) {
        const { rows } = await mysqlDb.query('SELECT userid FROM {prefix}userlist WHERE username = ? LIMIT 1', [editInfo[1]]);
        if (rows.length > 0) {
          const userMeta = await util.promisify(db.getObject.bind(db))(`_import:_user:${rows[0].userid}`);
          if (userMeta) {
            await util.promisify(Posts.setPostFields)(postData.pid, {
              edited: editInfo[0] * 1000,
              editor: userMeta.uid
            });
          }
        }
      }
    }

    if (row.islock === 1 || row.islock === 3) {
      await util.promisify(Topics.setTopicField)(topicData.tid, 'locked', 1);
    }

    await util.promisify(db.setObject.bind(db))(`_import:_topic:${row.tid}`, { tid: topicData.tid });
    await util.promisify(db.sortedSetAdd.bind(db))('_import:_topics', topicData.tid, row.tid);

    console.log(`Imported ${row.tid}.`);
  }
}

module.exports = ImportTopic;