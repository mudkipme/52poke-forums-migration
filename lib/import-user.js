const util = require('util');
const moment = require('moment');
const _ = require('lodash');
const mysqlDb = require('./db');
const User = module.parent.parent.require('./src/user');
const Groups = module.parent.parent.require('./src/groups');
const bbcode = require('./bbcode');

const groupNames = {
  0: 'administrators',
  1: 'Global Moderators',
  2: '版主',
  3: '认证会员',
  9: '认证会员',
  10: '认证会员'
};

let moneyToReputation = 1;
let pointToReputation = 25;
let bankInterest = 0.001;
let fixedInterest = 0.0015;

module.exports = async function (config) {
  let current = 0;
  let limit = 100;
  let finished = false;

  moneyToReputation = config.moneyToReputation || moneyToReputation;
  pointToReputation = config.pointToReputation || pointToReputation;
  bankInterest = config.bankInterest || bankInterest;
  fixedInterest = config.fixedInterest || fixedInterest;
  
  while (!finished) {
    const { rows } = await mysqlDb.query('SELECT * FROM {prefix}userlist ORDER BY userid LIMIT ?, ?', [current, limit]);
    if (rows.length === 0) {
      finished = true;
      break;
    }
    await importRows(rows);
    current += limit;
  }
};

async function importRows(rows) {
  for (let row of rows) {
    await importUser(row);
  }
}

async function importUser(row) {
  const username = cleanUsername(row.username);
  const birthday = formatBirthday(row.birthday);
  const picture = getUserPicture(row.avarts);
  const parameters = {
    username,
    password: row.pwd,
    timestamp: row.regdate ? parseInt(row.regdate.split('_')[0]) * 1000 : 0,
    email: row.mailadd,
    location: row.fromwhere,
    birthday,
    picture
  };

  let uid = null;
  do {
    try {
      uid = await util.promisify(User.create)(parameters);
    } catch (e) {
      if (e.message === '[[error:email-taken]]') {
        parameters.email = incrementEmail(parameters.email);
      } else {
        throw e;
      }
    }
  } while (!uid);

  // Fields:
  // userid, qqmsnicq, signtext, homepage, desper, headtitle, team
  // publicmail, *point*, *ugnum*, *money*, sex, national, lastlogin
  // *bank*, *savemt*, *medals*
  const [ qq, msn, icq ] = row.qqmsnicq.split('※');

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

  console.log(fields.signature);

  fields.reputation = Math.floor(row.point / 10) * pointToReputation + row.money * moneyToReputation;
  fields.reputation += (row.bankmimi || 0) * moneyToReputation;
  if (row.bank > 0) {
    let bank = row.bank;
    if (row.savemt > 0) {
      const days = Math.floor((Date.now() - row.savemt * 1000) / 864e5);
      if (days > 0) {
        bank += bankInterest * days * row.bank;
      }
    }
    fields.reputation += bank * moneyToReputation;
  }

  const { rows } = await mysqlDb.query('SELECT uid, moneynum, begintime, endtime FROM {prefix}banklog WHERE uid = ? AND czid = 5 AND islog = 1', [row.userid]);
  for (let deposit of rows) {
    let bank = deposit.moneynum;
    const days = Math.floor((Math.min(Date.now(), deposit.endtime * 1000) - deposit.begintime * 1000) / 864e5);
    bank += fixedInterest * days * deposit.moneynum;
    fields.reputation += bank * moneyToReputation;
  }

  fields.reputation = Math.floor(fields.reputation);

  await util.promisify(User.setUserFields)(uid, _.pickBy(fields));

  if (groupNames[row.ugnum]) {
    await util.promisify(Groups.join)(groupNames[row.ugnum], uid);
  }
  
  if (row.publicmail > 0) {
    await util.promisify(User.setSetting)(uid, 'showemail', 1);
  }

  if (parseInt(row.ugnum, 10) === 5 || row.point < 0) {
    await util.promisify(User.ban)(uid);
  }

  console.log(`Imported ${row.username}`);
}

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

function getUserPicture(avarts) {
  const pictureData = avarts.split('%');
  if (pictureData[1] && !pictureData[1].match(/^file/)) {
    return pictureData[1].match(/^http/) ? pictureData[1] : ('https://legacy.52poke.net/' + pictureData[1]);
  } else if (pictureData[0]) {
    let url = pictureData[0].replace(/[<&].*/, '');
    return 'https://legacy.52poke.net/images/avatars/' + url;
  }
  return '';
}

function formatBirthday(birthday) {
  birthday = birthday.split('年').join('-').split('月').join('-').split('日').join('').replace(/-+/g, '-');
  const timestamp = Date.parse(birthday);
  if (!isNaN(timestamp)) {
    return moment(timestamp).format('MM/DD/YYYY');
  }
  return '';
}