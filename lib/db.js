const mysql = require('mysql');

let pool = null;
let prefix = '';

exports.init = function (config) {
  pool = mysql.createPool({
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database
  });
  prefix = config.prefix;
};

exports.query = function (sql, values) {
  return new Promise((resolve, reject) => {
    if (sql) {
      sql = sql.split('{prefix}').join(prefix);
    }
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }

      connection.query(sql, values, (err, rows, fields) => {
        if (err) {
          return reject(err);
        }
        resolve({
          rows,
          fields
        });
        connection.release();
      });
    });
  });
};

exports.close = function () {
  pool.end();
};