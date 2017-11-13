/// <reference path="../node_modules/phaser/typescript/phaser.comments.d.ts"/>
import 'pixi';
import 'p2';
import 'phaser';

import Universe from './Universe';
import TestingAdapter from './environment/testing';

function main() {
  let adapter = new TestingAdapter();
  let universe = new Universe(adapter);

  universe.genesis();
}

main();
