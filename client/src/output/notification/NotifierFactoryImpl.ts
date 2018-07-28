import GraphicsFactory from '../../render/graphics/GraphicsFactory';
import {Phaser} from '../../util/alias/phaser';
import Point from '../../util/syntax/Point';
import NotifierFactory from './NotifierFactory';
import PoppingNotifier from './PoppingNotifier';

class NotifierFactoryImpl implements NotifierFactory {
  constructor(private game: Phaser.Game, private graphicsFactory: GraphicsFactory) {
  }

  createPoppingNotifier(speakerDisplay: PIXI.DisplayObjectContainer) {
    const view = this.graphicsFactory.createSpeechBubble();

    speakerDisplay.addChild(view.speechBox);
    view.speechBox.position = Point.of(-47, -185);

    view.speechBox.visible = false;

    return new PoppingNotifier(this.game, view);
  }
}

export default NotifierFactoryImpl;
