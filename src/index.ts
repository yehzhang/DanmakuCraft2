/// <reference path="../node_modules/phaser/typescript/phaser.comments.d.ts"/>
/// <reference path="./globals.d.ts"/>

if (__DEBUG__) {
  console.log = ((log) => {
    return function fakeLog(message: string) {
      if (message.indexOf('Phaser') !== -1) {
        return;
      }
      return log.apply(console, arguments);
    };
  })(console.log);
}

import 'pixi';
import 'p2';
import 'phaser';

import 'core-js/shim';

import Universe from './Universe';
import BiliBiliAdapter from './environment/bilibiliPlayer/BilibiliAdapter';
import TestingAdapter from './environment/testing';

function main() {
  let adapter;
  if (__DEBUG__) {
    adapter = new TestingAdapter();
  } else {
    adapter = new BiliBiliAdapter();
  }

  Universe.genesis(adapter);
}

main();
