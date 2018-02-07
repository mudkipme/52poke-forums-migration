const util = require('util');
const db = module.parent.parent.require('./src/database');
const mysqlDb = require('./db');
const Messaging = module.parent.parent.require('./src/messaging');
const bbcode = require('./bbcode');

const defaultConfig = {};

class ImportChat {
  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
  }

  async importAll() {
    let current = 0;
    let limit = 500;
    let finished = false;

    while (!finished) {
      const { rows } = await mysqlDb.query('SELECT * FROM {prefix}primsg ORDER BY id LIMIT ?, ?', [current, limit]);
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
      await this.importChat(row);
    }
  }

  async importChat(row) {
    if (!row.blid || !row.stid) {
      console.log(`Skip ${row.id}. (System message)`);
      return;
    }

    const imported = await util.promisify(db.isSortedSetMember)('_import:_chats', row.id);
    if (imported) {
      console.log(`${row.id} was already imported.`);
      return;
    }
    
    const from = await util.promisify(db.getObject)(`_import:_user:${row.blid}`);
    const to = await util.promisify(db.getObject)(`_import:_user:${row.stid}`);

    if (!from || !to) {
      console.log(`Skip ${row.id}. (User not exists)`);
      return;
    }

    let roomId = await util.promisify(Messaging.hasPrivateChat)(from.uid, to.uid);
    if (!roomId) {
      roomId = await util.promisify(Messaging.newRoom)(from.uid, [to.uid]);
    }

    let content = bbcode.markdownStripReserves(row.prcontent);
    content = content.split('](topic.php').join('](https://legacy.52poke.net/topic.php');
    if (content.length > 1000) {
      content = content.substr(0, 1000);
    } else if (content.length === 0) {
      console.log(`Skip ${row.id}. (Empty content)`);
      return;
    }
    const message = await util.promisify(Messaging.sendMessage)(from.uid, roomId, content, row.prtime * 1000);
    await util.promisify(Messaging.markRead)(to.uid, roomId);

    await util.promisify(db.setObject)(`_import:_chat:${row.id}`, { mid: message.mid, roomId });
    await util.promisify(db.sortedSetAdd)('_import:_chats', message.mid, row.id);

    console.log(`Imported ${row.id}.`);
  }
}

module.exports = ImportChat;