const util = require('util');
const mysqlDb = require('./db');
const db = module.parent.require('./src/database');
const importUser = require('./import-user');

const importer = {
  async run(type, config) {
    await util.promisify(db.init)();
    mysqlDb.init(config.mysql);
    switch (type) {
      case 'user':
        await importUser(config);
        break;
      default:
        console.log('Not implemented yet.');
        break;
    }
    mysqlDb.close();
  }
};

module.exports = importer;