const util = require('util');
const mysqlDb = require('./db');
const db = module.parent.require('./src/database');
const ImportUser = require('./import-user');
const ImportTopic = require('./import-topic');
const ImportPost = require('./import-post');
const ImportChat = require('./import-chat');

const importer = {
  async run(type, config) {
    await util.promisify(db.init)();
    mysqlDb.init(config.mysql);
    switch (type) {
      case 'user': {
        const importer = new ImportUser(config);
        await importer.importAll();
        break;
      }
      case 'topic': {
        const importer = new ImportTopic(config);
        await importer.importAll();
        break;
      }
      case 'post': {
        const importer = new ImportPost(config);
        await importer.importAll();
        break;
      }
      case 'signature': {
        const importer = new ImportUser(config);
        await importer.updateSignatures();
        break;
      }
      case 'notifications': {
        const importer = new ImportUser(config);
        await importer.purgeNotifications();
        break;
      }
      case 'chat': {
        const importer = new ImportChat(config);
        await importer.importAll();
        break;
      }
      case 'trophy': {
        const importer = new ImportUser(config);
        await importer.updateTrophies();
        break;
      }
      default:
        console.log('Not implemented yet.');
        break;
    }
    mysqlDb.close();
  }
};

module.exports = importer;