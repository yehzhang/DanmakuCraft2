if (__STAGE__) {
  console.log = ((log) => {
    return function fakeLog(message: any) {
      if (message.indexOf instanceof Function && message.indexOf('Phaser') !== -1) {
        return;
      }
      return log.apply(console, arguments);
    };
  })(console.log);
}

import p2 = require('phaser-ce-type-updated/build/custom/p2');
import PIXI = require('phaser-ce-type-updated/build/custom/pixi');
import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');
import 'core-js/shim';
import Universe from './Universe';

(window as any).p2 = p2;
(window as any).PIXI = PIXI;
(window as any).Phaser = Phaser;

function main() {
  Universe.genesis();
}

main();
