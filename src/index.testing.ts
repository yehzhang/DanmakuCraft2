/// <reference path="../node_modules/phaser/typescript/phaser.comments.d.ts"/>
console.log = ((log) => {
  return function fakeLog(message: string) {
    if (message.indexOf('Phaser') !== -1) {
      return;
    }
    return log.apply(console, arguments);
  };
})(console.log);

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
