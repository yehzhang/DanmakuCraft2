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

import 'core-js/shim';
import Universe from './Universe';

function main() {
  Universe.genesis();
}

main();
