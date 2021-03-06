52poke-forums-migration
=======================

This is a project to resurrect 52Poké Forums and migrate it to a modern [NodeBB](https://github.com/NodeBB/NodeBB) instance.

52Poké Forums had been using an ancient PHP forum software named [BMForum](https://github.com/marcchen/manduo). You are welcome to watch and contribute to this project if you happened to have a similar forum instance and plan to migrate to a modern vendor.

## Usage

1. Run `npm install git+https://github.com/mudkipme/52poke-forums-migration.git` to install.
2. Copy `bin/import` to the root directory of NodeBB.
3. Create a `migration.json` with the MySQL information of the old software.
4. Run `./import import <type>`.

## Progress

- [x] Create the NodeBB instance
- [x] Set up user groups and boards
- [x] Migrate user data
- [x] A parser to convert BBCode to Markdown
- [x] Migrate topics
- [x] Migrate posts
- [x] Migrate chats
- [x] Update parsed signatures
- [x] Simpified Chinese / Traditional Chinese conversion plugin
- [x] OAuth login from [52Poké Wiki](https://wiki.52poke.com/) users
- [x] Migrate the [Medal](https://wiki.52poke.com/wiki/%E5%A5%96%E7%89%8C)/[Badge](https://wiki.52poke.com/wiki/%E5%BE%BD%E7%AB%A0)/[Ribbon](https://wiki.52poke.com/wiki/%E5%A5%96%E7%AB%A0) system
- [x] A checking-in plugin for NodeBB
- [x] Support wikilinks
- [ ] A new Pokémon plugin for 52Poké Forums
- [ ] Lock the legacy 52Poké Forums

## Related Projects

* __[nodebb-plugin-sso-mediawiki](https://github.com/mudkipme/nodebb-plugin-sso-mediawiki):__ Allows users to login/register via 52Poké Wiki.
* __[nodebb-plugin-opencc](https://github.com/mudkipme/nodebb-plugin-opencc):__ Translates forum content between Traditional and Simplified Chinese.
* __[nodebb-plugin-md5-password](https://github.com/mudkipme/nodebb-plugin-md5-password):__ Supports login of imported users.
* __[nodebb-theme-persona-52poke-forums](https://github.com/mudkipme/nodebb-theme-persona-52poke-forums):__ Adds necessary features to NodeBB's default theme.
* __[nodebb-plugin-checkin](https://github.com/mudkipme/nodebb-plugin-checkin):__ Adds checking-in feature.
* __[nodebb-plugin-trophies-updated](https://github.com/mudkipme/nodebb-plugin-trophies):__ Creates reward badges and ribbons.
* __[nodebb-plugin-wikilink](https://github.com/mudkipme/nodebb-plugin-wikilink):__ Links `[[text]]` with 52Poké Wiki.
* __[paradise](https://github.com/mudkipme/paradise):__ The Pokémon plugin for 52Poké Forums.

## Copyright

All source codes (not including related projects) are under [BSD-3-Clause](LICENSE), and all documents are under [Attribution-NonCommercial-ShareAlike 3.0 Unported](docs/LICENSE).

52Poké (神奇宝贝部落格/神奇寶貝部落格, 神奇宝贝百科/神奇寶貝百科) is a Chinese-language Pokémon fan site. Neither the name of 52Poké nor the names of the contributors may be used to endorse any usage of codes and/or documents under this project.

Pokémon ©2018 Pokémon. ©1995-2018 Nintendo/Creatures Inc./GAME FREAK inc. 52Poké and this project is not affiliated with any Pokémon-related companies.