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

  test('font tag', () => {
    const result = bbcode.markdownFromBBCode('[font=Arial]Some custom text[/font]');
    expect(result).toEqual('Some custom text');
  });
});
