import NotifierFactory from './NotifierFactory';
import PoppingNotifier from './PoppingNotifier';
import GraphicsFactory from '../graphics/GraphicsFactory';
import Point from '../../util/syntax/Point';
import {Phaser} from '../../util/alias/phaser';

class NotifierFactoryImpl implements NotifierFactory {
  constructor(private game: Phaser.Game, private graphicsFactory: GraphicsFactory) {
  }

  createPoppingNotifier(speakerDisplay: PIXI.DisplayObjectContainer) {
    let view = this.graphicsFactory.createSpeechBubble();

    speakerDisplay.addChild(view.speechBox);
    view.speechBox.position = Point.of(-47, -185);

    view.speechBox.visible = false;

    return new PoppingNotifier(this.game, view);
  }
}

export default NotifierFactoryImpl;
