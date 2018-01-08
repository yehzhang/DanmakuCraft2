function injectPhaser() {
  // noinspection JSUndeclaredVariable
  PIXI = require('phaser-ce-type-updated/build/custom/pixi');
  // noinspection JSUndeclaredVariable
  p2 = require('phaser-ce-type-updated/build/custom/p2');
  // noinspection JSUndeclaredVariable
  Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');
}

function injectDom() {
  const jsdom = require('jsdom');

  let dom = new jsdom.JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
  window = dom.window;
  document = window.document;
  // noinspection JSUndeclaredVariable
  HTMLElement = window.HTMLElement;
}

function injectCanvas() {
  // See https://www.npmjs.com/package/canvas for installation
  // noinspection NpmUsedModulesInstalled
  const Canvas = require('canvas');

  Image = Canvas.Image;
}

injectDom();
injectCanvas();
injectPhaser();

require('core-js/shim');

const chai = require('chai');
chai.config.truncateThreshold = 0;
