const bbcode = require('bbcodejs');
const TurndownService = require('turndown');

const parser = new bbcode.Parser();
const turndownService = new TurndownService();

exports.markdownFromBBCode = function(str) {
  str = str.replace(/<br[^>]*>/g, '\n');
  const html = parser.toHTML(str);
  const markdown = turndownService.turndown(html);
  return markdown;
};