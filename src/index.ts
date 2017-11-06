/// <reference path="../node_modules/phaser/typescript/phaser.comments.d.ts"/>
import 'pixi';
import 'p2';
import 'phaser';

import DanmakuCraft from './danmakuCraft';
import BiliBiliAdapter from './environment/bilibili';

function main() {
  let adapter = new BiliBiliAdapter();
  let game = new DanmakuCraft(adapter);
  adapter.setWorldProxy(game.getProxy());
}

main();
