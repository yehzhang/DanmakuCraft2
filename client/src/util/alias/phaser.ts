/// <reference path='../../../../node_modules/phaser-ce-type-updated/typescript/phaser.d.ts' />

let global = Function('return this')();

export import p2 = require('phaser-ce-type-updated/build/custom/p2');
global.p2 = p2;


export import PIXI = require('phaser-ce-type-updated/build/custom/pixi');
global.PIXI = PIXI;

global.__WEBPACK__ = false;
if (!__WEBPACK__) {
  let injectDomIfNecessary = () => {
    if ('window' in global) {
      return;
    }

    const jsdom = require('jsdom');

    let dom = new jsdom.JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    Object.assign(global, {
      window: dom.window,
      document: dom.window.document,
      HTMLElement: dom.window.HTMLElement,
    });
  };

  let injectCanvasIfNecessary = () => {
    if ('Image' in global) {
      return;
    }

    // See https://www.npmjs.com/package/canvas for installation
    // noinspection NpmUsedModulesInstalled
    const Canvas = require('canvas');

    global.Image = Canvas.Image;
  };

  injectDomIfNecessary();
  injectCanvasIfNecessary();
}

export import Phaser = require('phaser-ce-type-updated/build/custom/phaser-split');
