const util = require('util');
const moment = require('moment');
const _ = require('lodash');
const db = module.parent.parent.require('./src/database');
const mysqlDb = require('./db');
const User = module.parent.parent.require('./src/user');
const Groups = module.parent.parent.require('./src/groups');
const bbcode = require('./bbcode');

const defaultConfig = {
  moneyToReputation: 1,
  pointToReputation: 25,
  bankInterest: 0.001,
  fixedInterest: 0.0015,
  groupNames: {
    0: 'administrators',
    1: 'Global Moderators'
  },
  avatars: [],
  bannedGroup: 5,
  maxReputation: 3500000
};

class ImportUser {
  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
  }

  async importAll() {
    let current = 0;
    let limit = 100;
    let finished = false;

    while (!finished) {
      const { rows } = await mysqlDb.query('SELECT * FROM {prefix}userlist ORDER BY userid LIMIT ?, ?', [current, limit]);
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
      await this.importUser(row);
    }
  }

  async importUser(row) {
    const imported = await util.promisify(db.isSortedSetMember.bind(db))('_import:_users', row.userid);
    if (imported) {
      console.log(`${row.username} was already imported.`);
      return;
    }

    const parameters = {
      username: cleanUsername(row.username),
      password: row.pwd,
      timestamp: row.regdate ? parseInt(row.regdate.split('_')[0]) * 1000 : 0,
      email: row.mailadd,
      location: row.fromwhere,
      birthday: formatBirthday(row.birthday),
      picture: this._getUserPicture(row.avarts)
    };

    let uid = null;
    do {
      try {
        uid = await util.promisify(User.create)(parameters);
      } catch (e) {
        if (e.message === '[[error:email-taken]]') {
          parameters.email = incrementEmail(parameters.email);
        } else if (e.message.indexOf('error:invalid-username') !== -1) {
          parameters.username = `IMPORTED_${row.userid}`;
        } else if (e.message === '[[error:invalid-email]]') {
          parameters.email = `imported_${row.userid}@52poke.net`;
        } else {
          throw e;
        }
      }
    } while (!uid);

    // Fields
    const [qq, msn, icq] = row.qqmsnicq.split('※');

    const fields = {
      _import_uid: row.userid,
      _import_qq: qq,
      _import_msn: msn,
      _import_icq: icq,
      _import_headtitle: row.headtitle,
      _import_team: row.team,
      _import_gender: row.sex,
      _import_national: row.national,
      website: row.homepage,
      aboutme: bbcode.markdownFromBBCode(row.desper),
      signature: bbcode.markdownFromBBCode(row.signtext),
      lastonline: row.lastlogin * 1000
    };

    fields.reputation = Math.floor(row.point / 10) * this.config.pointToReputation + row.money * this.config.moneyToReputation;

    // Calculate bank deposit and interest
    fields.reputation += (row.bankmimi || 0) * this.config.moneyToReputation;
    if (row.bank > 0) {
      let bank = row.bank;
      if (row.savemt > 0) {
        const days = Math.floor((Date.now() - row.savemt * 1000) / 864e5);
        if (days > 0) {
          bank += this.config.bankInterest * days * row.bank;
        }
      }
      fields.reputation += bank * this.config.moneyToReputation;
    }

    // Calculate fixed deposit and interest
    const { rows } = await mysqlDb.query('SELECT uid, moneynum, begintime, endtime FROM {prefix}banklog WHERE uid = ? AND czid = 5 AND islog = 1', [row.userid]);
    for (let deposit of rows) {
      let bank = deposit.moneynum;
      const days = Math.floor((Math.min(Date.now(), deposit.endtime * 1000) - deposit.begintime * 1000) / 864e5);
      bank += this.config.fixedInterest * days * deposit.moneynum;
      fields.reputation += bank * this.config.moneyToReputation;
    }

    fields.reputation = Math.floor(fields.reputation);
    if (this.config.maxReputation) {
      fields.reputation = Math.min(this.config.maxReputation, fields.reputation);
    }

    await util.promisify(User.setUserFields)(uid, _.pickBy(fields));

    if (fields.reputation > 0) {
      await util.promisify(db.sortedSetAdd.bind(db))('users:reputation', fields.reputation, uid);
    }

    if (this.config.groupNames[row.ugnum]) {
      await util.promisify(Groups.join)(this.config.groupNames[row.ugnum], uid);
    }

    if (row.publicmail > 0) {
      await util.promisify(User.setSetting)(uid, 'showemail', 1);
    }

    if (parseInt(row.ugnum, 10) === this.config.bannedGroup || row.point < 0) {
      await util.promisify(User.ban)(uid);
    }

    const { username, userslug } = await util.promisify(User.getUserFields)(uid, ['username', 'userslug']);
    await util.promisify(db.setObject.bind(db))(`_import:_user:${row.userid}`, { uid, username, userslug });
    await util.promisify(db.sortedSetAdd.bind(db))('_import:_users', uid, row.userid);

    console.log(`Imported ${row.username}. ${row.username !== username ? `Renamed to ${username}.` : ''}`);
  }

  _getUserPicture(avarts) {
    const pictureData = avarts.split('%');
    if (pictureData[1] && !pictureData[1].match(/^file/)) {
      const regex = /^https?:\/\/(assets|media|static)\.52poke\.(com|net)\//;
      const regexBBS = /^http:\/\/bbs\.52poke\.com\//;
      if (pictureData[1].match(regex)) {
        return pictureData[1].replace(regex, 'https://media.52poke.net/');
      } else if (pictureData[1].match(regexBBS)) {
        return pictureData[1].replace(regexBBS, 'https://legacy.52poke.net/');
      } else if (pictureData[1].match(/^upload\//)) {
        return 'https://legacy.52poke.net/' + pictureData[1];
      }
    }
    
    if (pictureData[0]) {
      let url = pictureData[0].replace(/[<&].*/, '');
      if (this.config.avatars.indexOf(url) !== -1 || this.config.avatars.indexOf(encodeURIComponent(url)) !== -1) {
        return 'https://legacy.52poke.net/images/avatars/' + url;
      }
    }
    return '';
  }
}

module.exports = ImportUser;

// From nodebb-plugin-import
// Copyright 2013 Aziz Khoury, MIT License
function cleanUsername(str) {
  str = str.replace(/[^\u00BF-\u1FFF\u2C00-\uD7FF\-.*\w\s]/gi, '');
  return str.replace(/ /g, '').replace(/\*/g, '').replace(/æ/g, '').replace(/ø/g, '').replace(/å/g, '');
}

// From nodebb-plugin-import
// Copyright 2013 Aziz Khoury, MIT License
function incrementEmail(email) {
  var parts = email.split('@');
  var parts2 = parts[0].split('+');

  var first = parts2.shift();
  var added = parts2.pop();

  var nb = 1;
  if (added) {
    var match = added.match(/__imported__(\d+)/);
    if (match && match[1]) {
      nb = parseInt(match[1], 10) + 1;
    } else {
      parts2.push(added);
    }
  }
  parts2.push('__imported__' + nb);
  parts2.unshift(first);
  parts[0] = parts2.join('+');

  return parts.join('@');
}

function formatBirthday(birthday) {
  birthday = birthday.split('年').join('-').split('月').join('-').split('日').join('').replace(/-+/g, '-');
  const timestamp = Date.parse(birthday);
  if (!isNaN(timestamp)) {
    return moment(timestamp).format('MM/DD/YYYY');
  }
  return '';
}