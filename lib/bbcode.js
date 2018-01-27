const bbcode = require('bbcodejs');
const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');
const sanitizeHtml = require('sanitize-html');
const cheerio = require('cheerio');

const parser = new bbcode.Parser();
const turndownService = new TurndownService();
const tables = turndownPluginGfm.tables;
turndownService.use([tables]);

// Disable over escape
bbcode.Renderer.prototype.escape = function(str) {
  return str;
};

const emojiMap = {
  ':titter:': ':smirk:',
  ':smoking:': ':smoking:',
  ':blackman:': ':fearful:',
  '[:o]': ':open_mouth:',
  ':’(': ':sob:',
  '[:S]': ':disappointed_relieved:',
  ':mad:': ':angry:',
  '[:P]': ':stuck_out_tongue_winking_eye:',
  '[:D]': ':grin:',
  '[:)]': ':smiley:',
  '[:(]': ':disappointed:',
  ':blush:': ':blush:',
  ':ninja:': ':grimacing:',
  ':excl:': ':sneezing_face:',
  ':glare:': ':cold_sweat:',
  ':lol:': ':heart_eyes:',
  ':wacko:': ':expressionless:',
  ':happy:': ':+1:',
  '[;)]': ':sunglasses:',
  ':wub:': ':blush:',
  ':mellow:': ':zipper_mouth_face:',
  ':sleeply:': ':sleepy:',
  ':disdainful:': ':face_with_rolling_eyes:',
  ':knife:': ':hocho:',
  ':dejecta:': ':hankey:'
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

class AlignTag extends bbcode.Tag {
  _toHTML() {
    const align = this.renderer.strip(this.params[this.name]);
    if (align === 'right') {
      return bbcode.BUILTIN.right.prototype._toHTML.call(this);
    } else if (align == 'center') {
      return bbcode.BUILTIN.center.prototype._toHTML.call(this);
    }
    return this.getContent();
  }
}

class SizeTag extends bbcode.BUILTIN.size {
  constructor(renderer, settings) {
    super(renderer, settings);
    const sizes = [8, 10, 12, 14, 16, 18, 24, 36];
    if (this.params[this.name]) {
      this.params[this.name] = sizes[this.params[this.name]] || 36;
    }
  }
}

class OlistTag extends bbcode.BUILTIN.list {
  constructor(renderer, settings) {
    super(renderer, settings);
    this.params['list'] = '1';
  }
}

class EmptyTag extends bbcode.Tag {
  _toHTML() {
    return this.getContent();
  }
}

class RemoveTag extends bbcode.Tag {
  _toHTML() {
    return '';
  }
}

class RestrictTag extends bbcode.Tag {
  _toHTML() {
    return '__RESTRICTED_CONTENT__';
  }
}

class UploadTag extends bbcode.Tag {
  _toHTML() {
    const id = parseInt(this.getContent());
    if (id > 0) {
      return `__UPLOAD__${id}__`;
    }
    return '';
  }
}

parser.registerTag('email', EmailTag);
parser.registerTag('bt', bbcode.BUILTIN.link);
parser.registerTag('ed', bbcode.BUILTIN.link);
parser.registerTag('align', AlignTag);
parser.registerTag('size', SizeTag);
parser.registerTag('font', EmptyTag);
parser.registerTag('olist', OlistTag);
parser.registerTag('fly', EmptyTag);
parser.registerTag('move', EmptyTag);
parser.registerTag('title', EmptyTag);
parser.registerTag('hidden', EmptyTag);
parser.registerTag('flash', RemoveTag);
parser.registerTag('asf', RemoveTag);
parser.registerTag('rm', RemoveTag);
parser.registerTag('shadow', EmptyTag);
parser.registerTag('glow', EmptyTag);
parser.registerTag('gift', EmptyTag);
parser.registerTag('beg', EmptyTag);
parser.registerTag('post', RestrictTag);
parser.registerTag('pay', RestrictTag);
parser.registerTag('hide', RestrictTag);
parser.registerTag('hpost', RestrictTag);
parser.registerTag('hmoney', RestrictTag);
parser.registerTag('upload', UploadTag);

exports.markdownFromBBCode = function(str) {
  str = sanitizeHtml(str, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
  });
  str = parser.toHTML(str);

  // emoji
  Object.keys(emojiMap).forEach(key => {
    str = str.split(key).join(emojiMap[key]);
  });

  // Fix table
  const $ = cheerio.load(str, { decodeEntities: false });
  $('table tr:first-of-type td').replaceWith(function () {
    return $('<th />').html($(this).html());
  });
  str = $.html();

  str = turndownService.turndown(str);

  // Fix Wiki Links
  str = str.replace(/\\\[\\\[([^\]]*)\\\]\\\]/g, '[[$1]]');

  str = replaceURL(str);
  return str;
};

function replaceURL(str) {
  const regexMedia = /https?:\/\/(assets|media|static)\.52poke\.(com|net)\//g;
  const regexBBS = /http:\/\/bbs\.52poke\.com\//g;
  str = str.replace(regexMedia, 'https://media.52poke.net/').replace(regexBBS, 'https://legacy.52poke.net/');
  return str;
}