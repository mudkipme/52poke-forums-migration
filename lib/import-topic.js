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
      // For test, only import 500 topics
      break;
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

    const userMeta = await util.promisify(db.setObject.bind(db))(`_import:_user:${row.authorid}`);
    if (!userMeta) {
      console.log(`Skip ${row.tid}. (Author not exists)`);
    }

    const isBanned = await util.promisify(User.isBanned)(userMeta.uid);
    if (isBanned) {
      console.log(`Skip ${row.tid}. (Author banned)`);
    }

    const content = post.toMarkdown({
      tid: row.tid,
      content: row.content,
      upload: row.other3,
      hasRestrict: row.type === 1
    });

    const parameters = {
      uid: userMeta.uid,
      title: row.title,
      content,
      cid: cid,
      req: {
        ip: row.ip
      },
      timestamp: row.time * 1000
    };

    const { topicData, postData } = await util.promisify(Topics.post(parameters));

    if (row.other4) {
      // Edit info
      const editInfo = row.other4.split('%');
      if (editInfo.length >= 2) {
        const { rows } = await mysqlDb.query('SELECT userid FROM {prefix}userlist WHERE username = ? LIMIT 1', [editInfo[1]]);
        if (rows.length > 0) {
          const userMeta = await util.promisify(db.setObject.bind(db))(`_import:_user:${rows[0].userid}`);
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
    await util.promisify(db.sortedSetAdd.bind(db))('_import:topics', topicData.tid, row.tid);

    console.log(`Imported ${row.tid}.`);
  }
}

module.exports = ImportTopic;