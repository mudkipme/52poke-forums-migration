const util = require('util');
const db = module.parent.parent.require('./src/database');
const mysqlDb = require('./db');
const User = module.parent.parent.require('./src/user');

const defaultConfig = {};

class ImportCheckin {
  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
  }

  async importAll() {
    let current = 0;
    let limit = 500;
    let finished = false;

    while (!finished) {
      const { rows } = await mysqlDb.query('SELECT * FROM {prefix}sign_history ORDER BY sign_time, rank_of_day LIMIT ?, ?', [current, limit]);
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
      await this.importCheckin(row);
    }
  }

  async importCheckin(row) {
    const userMeta = await util.promisify(db.getObject)(`_import:_user:${row.userid}`);
    if (!userMeta) {
      console.log(`Skip ${row.sign_time}. (User ${row.userid} not exists)`);
      return;
    }

    const uid = userMeta.uid;
    const date = dateKey(row.sign_time * 1000);
    const yesterday = dateKey(row.sign_time * 1000 - 864e5);
    const [rank, checkedInYesterday, continuousDays, total] = await Promise.all([
      util.promisify(db.increment)(`checkin-plugin:rank:${date}`),
      util.promisify(db.isSortedSetMember)(`checkin-plugin:${yesterday}`, uid),
      util.promisify(db.getObjectField)(`user:${uid}`, 'checkinContinuousDays'),
      util.promisify(db.sortedSetCard)(`checkin-plugin:user:${uid}`)
    ]);

    const continuousDay = checkedInYesterday ? (parseInt(continuousDays) || 0) + 1 : 1;

    await Promise.all([
      util.promisify(db.sortedSetAdd)(`checkin-plugin:${date}`, rank, uid),
      util.promisify(db.sortedSetAdd)(`checkin-plugin:user:${uid}`, row.sign_time * 1000, date),
      util.promisify(db.sortedSetAdd)('checkin-plugin:continuous', continuousDay, uid),
      util.promisify(db.sortedSetAdd)('checkin-plugin:total', total + 1, uid),
      util.promisify(User.setUserFields)(uid, {
        checkinContinuousDays: continuousDay,
        checkinPendingReward: row.post_num > 0 ? 0 : row.gift_amount
      })
    ]);

    console.log(`Imported ${row.sign_time}`);
  }
}

function dateKey(timestamp) {
  const date = new Date(timestamp);
  return date.getFullYear() + `${date.getMonth() + 1}`.padStart(2, '0') + `${date.getDate()}`.padStart(2, '0');
}


module.exports = ImportCheckin;