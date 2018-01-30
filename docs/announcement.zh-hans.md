# キミに決めてほんと良かった，神奇宝贝部落格社区 新版公告

神奇宝贝部落格社区（52Poké Forums）即将于2018年2月初升级到新版，并重新开放用户注册、未登录用户浏览等功能，旧版社区将继续保留，但会关闭发帖等部分功能。这将是已有超过12年历史的神奇宝贝部落格社区，作为中文宝可梦论坛之一的新的开始。

神奇宝贝部落格社区新版采用开源项目 [NodeBB](http://nodebb.org/) 构建，旧版中的所有用户信息、发帖、回复和私信均会迁移到新版。新版采用单一的积分（声望）体系，现有会员的声望根据2018年1月中旬的 Poké 和积分计算，计算方式为 Poké \* 1 + 积分 \* 25，包括旧版银行系统中的存款和截止2018年1月1日的利息，迁移声望上限为 3,500,000；迁移的主题会包含旧版的连接，以方便现有会员继续浏览受积分或回复等限制的内容。部分有特殊字符或冲突的用户名会有变更，如果无法在新版社区登录请在旧版社区的本帖回复查询，如忘记密码可用邮箱重置或私信联系我用QQ邮箱重置。徽章和奖章与签到功能将在不久后恢复，现有的徽章和奖章也会迁移到新版。

得益于现代 Web 技术的成果，新版论坛系统包括上百项改进。新版采用响应式布局，适合智能手机等移动设备浏览，并可加入主屏幕；发帖支持 Markdown 即时预览，并可在撰写帖子时切换版块浏览其他内容，未发布的帖子亦可自动保存为草稿；论坛系统中可以关注主题或作者，并在更新时会收到实时通知；版块或主题下的帖子列表可以随滚动自动翻页，亦可快速点击切换。

神奇宝贝百科注册用户可以直接通过神奇宝贝百科登录新版。新版具有和神奇宝贝百科、神奇宝贝部落格主页类似的简繁转换功能，语言设置为简体中文/繁体中文的用户看到的主题、帖子等内容会被转换为对应语言设置的中文文字版本（如希望关闭此功能，目前可以将界面修改为英语或其他语言，未来可能会提供对应设置）。

关于宝可梦论坛插件，对应新版社区的重新开发仍需无法预计的更久时间。目前旧版系统的宠物插件（V5 与神奇宝贝乐园）仍可使用，在新版开发完成后可迁移至新版，这期间的 Poké 消费则不会影响到新版社区。

---- 

神奇宝贝部落格（包括神奇宝贝百科、神奇宝贝部落格社区）线上所使用的软件代码会在今年内全部以 MIT、BSD-3-Clause 或 GPL 协议开源。在新版神奇宝贝部落格社区建设中开发的项目如下所列。如果您有相似的需求，比如升级自己的论坛、添加简繁转换或 MediaWiki 登录等，欢迎关注和参与这些项目。未来签到和宝可梦论坛插件在建设中亦会开源。

* [52poke-forums-migration](https://github.com/mudkipme/52poke-forums-migration)：从 BMForum 向 NodeBB 数据迁移工具
* [nodebb-plugin-md5-password](https://github.com/mudkipme/nodebb-plugin-md5-password)：支持迁移后用户登录的 NodeBB 插件（原 MD5 数据需经过 bcrypt 重新加密）
* [nodebb-plugin-sso-mediawiki](https://github.com/mudkipme/nodebb-plugin-sso-mediawiki)：支持 MediaWiki 实例（如神奇宝贝百科）用户登录的 NodeBB 插件
* [nodebb-plugin-opencc](https://github.com/mudkipme/nodebb-plugin-opencc)：NodeBB 简繁中文转换插件

---- 

大致介绍了新版社区，想要谈一下在2018年的现在，将神奇宝贝部落格社区重建的想法。

今天随着中心化的社交网络成为主流，传统「论坛」日渐式微是不争的事实。今天的互联网络早已不是十数年前虚拟空间，而早已成为这个三次元世界的一部分。然而今天我们的数字生活，真的相比过去更加美好，真的是理想中应有的样子么。过去很长一段时间一直被这样的问题困扰甚至迷茫和绝望。多年前诞生的本会让世界更加相连的那些平台，却因 Echo chamber 效应让这个世界更加分化隔阂，甚至间接在过去的两年间对这个世界产生了深远的消极影响；我们习惯于看到被认为我们喜欢看到的信息，而不是本应看到的丰富多彩的比特。

搬迁部落格社区数据时有很多有趣的发现唤醒了关于过去的互联网络的记忆，比如大家传图使用的各种各样的图床，photobucket，imgur，tinypic，等等，虽然很多已经成为历史或者不再支持外链，但看到那些错误提示的图片时还会会心一笑；比如大家在签名中为自己的 Blog，甚至自己搭建的论坛宣传，原来曾经很多人都曾亲自建设自己在虚拟世界的家；原来在过去，我们使用的互联网产品要比今天还要多样。

但是这一切，并不是说今天这个时代不如过去。恰恰相反，在过去数年间，我们实现了很多过去可能都不曾奢望的梦想。2014年8月，从口袋妖怪贴吧开始的一次 [Pokémon 游戏中文化请愿](http://makeawish.52poke.net/)，最终在 Pokémon 系列20周年的零点实现在精灵宝可梦 太阳／月亮加入中文，也拉开了任天堂以致众多游戏厂商重视中文市场的序幕。正版宝可梦动画和商品已成为日常，宝可梦电影也登上中国大陆的荧幕。人们和过去一样仍在 Wiki 协作、分享和获取知识，很高兴[神奇宝贝百科](https://wiki.52poke.com/)也是其中活跃的一部分。

所以还有很多可以做的事，和宝可梦的相遇以及 52Poké 的存在，是对我来说最宝贵的东西。2017年的终末在播客中听到一句无关紧要的话「[互联网不会变好，但我们可以自救](https://yitianshijie.net/69)」；2018年初在时间线上看到一条被转发的微博「[虽然小时候待过的乡下老房子都拆了，但是小时候待过的口袋妖怪论坛都还活着](https://weibo.com/2521660234/FCNI5s5cV)」。虽然大概和 52Poké 无关，但些许受到了触动。不过对一个论坛来说，仅仅存在着是不够的，作为回忆的一部分更是不够的；哪怕是冷清的地方，但它需要是舒适和愉快的地方。

关于神奇宝贝部落格社区重制的计划从2014年开始构想，目前的方案在2016年基本确定，但种种原因的拖延时至2017年末仍然只是开始。虽然也没有特别大的动力，只是一天稍微抽空一点 commit 的努力，终于差不多近一个月完成了一个里程碑；神奇宝贝百科的基础架构也有了不小的改变（虽然这段时间由于折腾弄的比较不稳定）。

有些私心的话想提前说。虽然从内容版权的角度，论坛的帖子属于作者本人，百科的编辑是共有版权和创作共用授权。但 52Poké 是「我」的东西，而不是「大家」的东西。请理解我有权决定这里欢迎与不欢迎哪些内容，也希望无论是过去的会员，还是新注册的同学都能阅读社区守则。

---- 

最后，想用精灵宝可梦 X·Y主题曲 [KISEKI](https://wiki.52poke.com/wiki/KISEKI) 结尾，希望这个新的开始，能重新把这里变成更温馨的地方，再现更美好的宝可梦世界。虽然 52Poké 是亲手创建的东西，但从2005年末开始，キミに決めてほんと良かった。

> You and I were born  
> right here in the same world.  
>   
> For this one brief life,  
> we're beneath the same sky.  
>   
> The great flow of time.  
> The wide expanse of space.  
>   
> We are lucky enough  
> to share this lifetime we get.  
>   
> We can gain more if we give.  
> By taking, we only lose.  
>   
> Let us make this a new age  
> where we show our gratitude.  
>   
> There's a fragile bud of hope,  
> blooming in each of our hearts.  
>   
> Don't you take that away.  
> Our dreams are meant to be shared.  
>   
> Let it grow. Let it live.  
> Let us see what it will bring.  
>   
> When we share in our love,  
> we make a beautiful world.  
>   
> Search it out, and find the way:  
> the point where we can all meet.  
>   
> The point where we're all the same.  
> There it lies: the future we seek.  
>   
> Start from there, and then we'll forge  
> a world where all can be free.  
>   
> Free to dream, and free to smile.  
> Free to be who we will be.  
>   
> Let's make sure we create...  
>   
> A world of our hopes and dreams.  
>   
> In our brief lives,  
> we've managed to meet.  
> Treasure this gift,  
> this precious time that we have.  
>   
> In our brief lives,  
> we've managed to meet.  
> Treasure this gift,  
> this precious time that we have.