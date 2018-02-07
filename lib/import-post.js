const util = require('util');
const db = module.parent.parent.require('./src/database');
const mysqlDb = require('./db');
const User = module.parent.parent.require('./src/user');
const Topics = module.parent.parent.require('./src/topics');
const Posts = module.parent.parent.require('./src/posts');
const post = require('./post');

const defaultConfig = {};

class ImportPost {
  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
  }

  async importAll() {
    let current = 0;
    let start = 0;
    const indexes = await util.promisify(db.getSortedSetRevRange)('_import:_posts', 0, 0);
    if (indexes.length > 0) {
      start = parseInt(indexes[0]);
    }
    let limit = 500;
    let finished = false;

    while (!finished) {
      const { rows } = await mysqlDb.query('SELECT * FROM {prefix}posts WHERE id > ? ORDER BY id LIMIT ?, ?', [start, current, limit]);
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
      await this.importPost(row);
    }
  }

  async importPost(row) {
    const imported = await util.promisify(db.isSortedSetMember)('_import:_posts', row.id);
    if (imported) {
      console.log(`${row.id} was already imported.`);
      return;
    }

    if (row.id === row.tid) {
      console.log(`Skip ${row.id}. (Topic already imported)`);
      return;
    }

    if (row.posttrash) {
      console.log(`Skip ${row.id}. (In trash)`);
      return;
    }

    if (parseInt(row.other1) < 0) {
      console.log(`Skip ${row.id}. (Point is lower than 0)`);
    }

    const userMeta = await util.promisify(db.getObject)(`_import:_user:${row.usrid}`);
    if (!userMeta) {
      console.log(`Skip ${row.id}. (Author ${row.usrid} not exists)`);
      return;
    }

    const isBanned = await util.promisify(User.isBanned)(userMeta.uid);
    if (isBanned) {
      console.log(`Skip ${row.id}. (Author banned)`);
      return;
    }

    const topicMeta = await util.promisify(db.getObject)(`_import:_topic:${row.tid}`);
    if (!topicMeta) {
      console.log(`Skip ${row.id}. (Topic ${row.tid} not exists)`);
      return;
    }

    const locked = await util.promisify(Topics.getTopicField)(topicMeta.tid, 'locked');
    if (locked) {
      // Unlock topic first
      await util.promisify(Topics.setTopicField)(topicMeta.tid, 'locked', 0);
    }

    row.articlecontent = row.articlecontent.replace(/\\(.)/g, '$1');

    const content = post.toMarkdown({
      id: row.id,
      tid: row.tid,
      content: row.articlecontent,
      upload: row.other3,
      hasRestrict: row.type === 1
    });

    const parameters = {
      uid: userMeta.uid,
      content,
      tid: topicMeta.tid,
      req: {
        ip: row.ip
      },
      timestamp: row.timestamp * 1000
    };

    let postData = null;

    try {
      postData = await util.promisify(Topics.reply)(parameters);
    } catch (e) {
      if (e.message === '[[error:no-privileges]]') {
        console.log(`Skip ${row.id}. (No privileges)`);
        return;
      }
      throw e;
    }

    if (row.other4) {
      // Edit info
      await post.markEdit({
        edit: row.other4,
        db,
        Posts,
        pid: postData.pid
      });
    }

    if (locked) {
      // Lock topic again
      await util.promisify(Topics.setTopicField)(topicMeta.tid, 'locked', 1);
    }

    await util.promisify(db.setObject)(`_import:_post:${row.id}`, { pid: postData.pid });
    await util.promisify(db.sortedSetAdd)('_import:_posts', postData.pid, row.id);

    console.log(`Imported ${row.id}.`);
  }
}

module.exports = ImportPost;