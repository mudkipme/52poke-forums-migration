const bbcode = require('bbcodejs');
const TurndownService = require('turndown');
const sanitizeHtml = require('sanitize-html');

const parser = new bbcode.Parser();
const turndownService = new TurndownService();

// Disable over escape
bbcode.Renderer.prototype.escape = function(str) {
  return str;
};

class EmailTag extends bbcode.Tag {
  _toHTML() {
    let url = this.renderer.strip(this.params[this.name] || this.getContent(true));
    if (/javascript:/i.test(url)) {
      url = '';
    }
    if (url) {
      return this.renderer.context({
        'linkify': false
      }, () => {
        return ['<a href="mailto:' + url + '">', this.getContent(), '</a>'];
      });
    } else {
      return this.getContent();
    }
  }
}

class FontTag extends bbcode.Tag {
  _toHTML() {
    return this.getContent();
  }
}

parser.registerTag('email', EmailTag);
parser.registerTag('bt', bbcode.BUILTIN.link);
parser.registerTag('ed', bbcode.BUILTIN.link);
parser.registerTag('font', FontTag);

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