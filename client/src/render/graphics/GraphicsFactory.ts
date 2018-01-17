import Comment from '../../entitySystem/component/Comment';
import TextShadowStyle from '../TextShadowStyle';

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

  createWorldCenterSign(size: number, color: string): PIXI.DisplayObjectContainer;

  createWorldOriginSign(size: number, color: string): Phaser.Text;

  createPixelParticleSpriteSheet(color?: number, size?: number): string;
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
