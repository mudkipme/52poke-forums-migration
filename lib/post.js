const bbcode = require('./bbcode');
const _ = require('lodash');

exports.toMarkdown = function ({ tid, content, upload, hasRestrict }) {
  content = bbcode.markdownFromBBCode(content);
  content = content.replace(/__RESTRICTED_CONTENT__/g, () => {
    hasRestrict = true;
    return '';
  });
  const uploads = _.pickBy(upload.split('×').map(item => {
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
  content = content.replace(/__UPLOAD__(\d+)__/g, (_, id) => {
    id = parseInt(id) - 1;
    if (id < usedUpload.length) {
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
    content += `\n\n* 请到[原帖子](https://legacy.52poke.net/topic_${tid})浏览更多内容。*`;
  }
  return content;
};