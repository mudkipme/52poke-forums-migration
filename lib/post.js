const bbcode = require('./bbcode');
const _ = require('lodash');
const cheerio = require('cheerio');

exports.toMarkdown = function ({ tid, id, content, upload, hasRestrict }) {
  content = bbcode.markdownFromBBCode(content);
  content = content.replace(/%%RESTRICTED_CONTENT%%/g, () => {
    hasRestrict = true;
    return '';
  });
  const uploads = _.filter(upload.split('×').map(item => {
    const fileInfo = item.replace(/[[\]]/g, '').split('◎');
    if (fileInfo.length < 4) {
      return null;
    }
    if (fileInfo[0].match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
      return `![${fileInfo[3]}](https://legacy.52poke.net/upload/${fileInfo[0]})`;
    } else {
      return `[下载 ${fileInfo[3]}](https://legacy.52poke.net/upload/${fileInfo[0]})`;
    }
  }));
  let usedUpload = new Set();
  content = content.replace(/%%UPLOAD%%(\d+)%%/g, (_, id) => {
    id = parseInt(id) - 1;
    if (id < uploads.length) {
      usedUpload.add(id);
      return uploads[id];
    }
    return '';
  });
  content = content.trim();
  uploads.forEach((upload, id) => {
    if (!usedUpload.has(id)) {
      content += '\n\n' + upload;
    }
  });
  if (hasRestrict) {
    content += `\n\n_请到[原帖子](https://legacy.52poke.net/topic_${tid})浏览更多内容。_`;
  } else if (id === tid) {
    content += `\n\n_[点击这里](https://legacy.52poke.net/topic_${tid})浏览原始主题。_`;
  }
  return content;
};

exports.formatTitle = function (str) {
  const $ = cheerio.load(str, { decodeEntities: false });
  return $.text();
};