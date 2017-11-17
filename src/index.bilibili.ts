/// <reference path="../node_modules/phaser/typescript/phaser.comments.d.ts"/>
import 'pixi';
import 'p2';
import 'phaser';

import Universe from './Universe';
import BiliBiliAdapter from './environment/implementation/bilibili';

function main() {
  let adapter = new BiliBiliAdapter();
  let universe = new Universe(adapter);
  adapter.setUniverseProxy(universe.getProxy());

  universe.genesis();
}

main();
