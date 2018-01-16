const bbcode = require('bbcodejs');
const TurndownService = require('turndown');
const sanitizeHtml = require('sanitize-html');

const parser = new bbcode.Parser();
const turndownService = new TurndownService();

// Disable over escape
bbcode.Renderer.prototype.escape = function(str) {
  return str;
};

exports.markdownFromBBCode = function(str) {
  str = sanitizeHtml(str, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
  });
  str = parser.toHTML(str);
  str = turndownService.turndown(str);
  str = replaceURL(str);
  return str;
};

function replaceURL(str) {
  const regexMedia = /https?:\/\/(assets|media|static)\.52poke\.(com|net)\//g;
  const regexBBS = /http:\/\/bbs\.52poke\.com\//g;
  str = str.replace(regexMedia, 'https://media.52poke.net/').replace(regexBBS, 'https://legacy.52poke.net/');
  return str;
}