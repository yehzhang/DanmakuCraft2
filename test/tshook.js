require('core-js/shim');

const chai = require('chai');
chai.config.truncateThreshold = 0;

global.__DEV__ = false;
global.__LOCAL__ = false;
global.__WEBPACK__ = false;
