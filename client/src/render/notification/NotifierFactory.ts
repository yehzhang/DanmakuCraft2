import PoppingNotifier from './PoppingNotifier';
import {PIXI} from '../../util/alias/phaser';

interface NotifierFactory {
  createPoppingNotifier(speakerDisplay: PIXI.DisplayObjectContainer): PoppingNotifier;
}

export default NotifierFactory;
