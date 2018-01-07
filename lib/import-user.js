const util = require('util');
const mysqlDb = require('./db');
const User = module.parent.parent.require('./src/user');

module.exports = async function (config) {
  let current = 0;
  let limit = 100;
  let finished = false;
  
  while (!finished) {
    const sql = `SELECT * FROM {prefix}userlist ORDER BY userid LIMIT ${current}, ${limit}`;
    const { rows } = await mysqlDb.query(sql);
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
    try {
      await importRow(row);
    } catch (e) {
      console.log(e);
    }
  }
}

async function importRow(row) {
  await util.promisify(User.create)({
    username: row.username,
    password: row.pwd,
    timestamp: row.regdate ? parseInt(row.regdate.split('_')[0]) * 1000 : 0,
    email: row.mailadd
  });
  console.log(`Imported ${row.username}`);
}