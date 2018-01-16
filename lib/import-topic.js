const util = require('util');
const db = module.parent.parent.require('./src/database');
const mysqlDb = require('./db');
const bbcode = require('./bbcode');

const defaultConfig = {};

// tid, id, toptype, ttrash, lastreply, topic, forumid, hits, replys, changetime, itsre
// type, newdesc, author, authorid, content, time, ip, face, options, other1, other2, other3
// other4, other5, statdata, addinfo, alldata, replyer, ttagname, ttagid, ordertrash, diggcount

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
    const imported = await util.promisify(db.isSortedSetMember.bind(db))('_import:_topics', row.id);
    if (imported) {
      console.log(`${row.id} was already imported.`);
      return;
    }

    console.log(`----- Begin test ${row.id} -----`);
    console.log(bbcode.markdownFromBBCode(row.content));
    console.log('----- End test -----');
  }
}

module.exports = ImportTopic;