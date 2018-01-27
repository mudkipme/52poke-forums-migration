const post = require('../lib/post');

describe('52poke-forums-migration.post', () => {
  test('post with upload', () => {
    const result = post.toMarkdown({
      tid: 1,
      content: 'hello',
      upload: 'month20083/test.jpg◎◎0◎.jpg◎118175◎1×',
      hasRestrict: false
    });
    expect(result).toEqual(`hello

![.jpg](https://legacy.52poke.net/upload/month20083/test.jpg)`);
  });

  test('post with upload in post', () => {
    const result = post.toMarkdown({
      tid: 1,
      content: 'hello<br><br>[upload]1[/upload]<br><br>hello',
      upload: 'month20083/test.jpg◎◎0◎.jpg◎118175◎1×',
      hasRestrict: false
    });
    expect(result).toEqual(`hello  
  
![.jpg](https://legacy.52poke.net/upload/month20083/test.jpg)  
  
hello`);
  });
});