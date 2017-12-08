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

function main() {
  Universe.genesis();
}

main();
