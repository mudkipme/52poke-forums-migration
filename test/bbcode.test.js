const bbcode = require('../lib/bbcode');

describe('52poke-forums-migration.bbcode', () => {
  test('email tag with content', () => {
    const result = bbcode.markdownFromBBCode('[email=yourname@example.com]My Email[/email]');
    expect(result).toEqual('[My Email](mailto:yourname@example.com)');
  });

  test('email tag without content', () => {
    const result = bbcode.markdownFromBBCode('[email]yourname@example.com[/email]');
    expect(result).toEqual('[yourname@example.com](mailto:yourname@example.com)');
  });

  test('align tag', () => {
    const result = bbcode.markdownFromBBCode('[align=right]Some custom text[/align]');
    expect(result).toEqual('Some custom text');
  });

  test('size tag', () => {
    const result = bbcode.markdownFromBBCode('[size=3]Some custom text[/size]');
    expect(result).toEqual('Some custom text');
  });

  test('font tag', () => {
    const result = bbcode.markdownFromBBCode('[font=Arial]Some custom text[/font]');
    expect(result).toEqual('Some custom text');
  });

  test('olist tag', () => {
    const result = bbcode.markdownFromBBCode(`[olist][*]list item 1
[*]list item 2
[/olist]`);
    expect(result).toEqual(`1.  list item 1
2.  list item 2`);
  });

  test('table tag', () => {
    const result = bbcode.markdownFromBBCode(`[table]
[tr][td]row 1 column 1[/td][td]row 1 column 2[/td][td]row 1 column 3[/td][/tr]
[tr][td]row 2 column 1[/td][td]row 2 column 2[/td][td]row 2 column 3[/td][/tr]
[/table]`);
    expect(result).toEqual(`| row 1 column 1 | row 1 column 2 | row 1 column 3 |
| --- | --- | --- |
| row 2 column 1 | row 2 column 2 | row 2 column 3 |`);
  });

  test('wiki link', () => {
    const result = bbcode.markdownFromBBCode('[[神奇宝贝百科]]');
    expect(result).toEqual('[[神奇宝贝百科]]');
  });
});
