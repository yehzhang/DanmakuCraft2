function injectPhaser() {
  // noinspection JSUndeclaredVariable
  PIXI = require('phaser/build/pixi');
  // noinspection JSUndeclaredVariable
  p2 = require('phaser/build/p2');
  // noinspection JSUndeclaredVariable
  Phaser = require('phaser');
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
