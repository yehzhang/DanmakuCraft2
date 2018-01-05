import Comment from '../../entitySystem/component/Comment';
import {TextShadowStyle} from '../../environment/interface/SettingsManager';

interface GraphicsFactory {
  createTextFromComment(comment: Comment): Phaser.Text;

  createText(
      text: string,
      size: number,
      color: string,
      fontFamily?: string,
      textShadowStyle?: TextShadowStyle,
      maxLines?: number): Phaser.Text;

  createTinyTelevision(): PlayerView;

  createChest(): Phaser.Sprite;

  createSpeechBubble(): NotifierView;
}

export default GraphicsFactory;

export class PlayerView {
  constructor(readonly display: Phaser.Sprite, readonly walkingAnimation: Phaser.Animation) {
  }
}

export class NotifierView {
  constructor(
      readonly speechBox: Phaser.Graphics,
      readonly textField: Phaser.Text,
      readonly textBoundsWidth: number) {
  }
}
