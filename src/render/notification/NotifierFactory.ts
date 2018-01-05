import PoppingNotifier from './PoppingNotifier';

interface NotifierFactory {
  createPoppingNotifier(speakerDisplay: PIXI.DisplayObjectContainer): PoppingNotifier;
}

export default NotifierFactory;
