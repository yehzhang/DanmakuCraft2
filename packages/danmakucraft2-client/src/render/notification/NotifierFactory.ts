import PoppingNotifier from './PoppingNotifier';
import PIXI = require('phaser-ce-type-updated/build/custom/pixi');

interface NotifierFactory {
  createPoppingNotifier(speakerDisplay: PIXI.DisplayObjectContainer): PoppingNotifier;
}

export default NotifierFactory;
