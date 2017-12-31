import TinyTelevisionBuilder from './TinyTelevisionBuilder';
import IdGenerator from '../../util/IdGenerator';
import {TextShadowStyle} from '../../environment/interface/SettingsManager';
import Comment from '../../entitySystem/component/Comment';
import Colors from '../Colors';

class GraphicsFactory {
  constructor(
      private game: Phaser.Game,
      private idGenerator: IdGenerator,
      private fontFamily: string,
      private textShadowStyle: TextShadowStyle) {
  }

  createTextFromComment(comment: Comment): Phaser.Text {
    let color = Phaser.Color.getWebRGB(comment.color);
    let text = this.createText(comment.text, comment.size, color);
    text.anchor.setTo(0.5);
    return text;
  }

  createText(text: string, size: number, color: string): Phaser.Text {
    let textDisplay = this.game.make.text(
        0,
        0,
        text,
        {
          font: this.fontFamily,
          fontSize: size,
          fill: color,
        });

    switch (this.textShadowStyle) {
      case TextShadowStyle.GLOW:
      case TextShadowStyle.OUTLINE:
        textDisplay.setShadow(0, 0, Colors.BLACK, 2);
        textDisplay.strokeThickness = 1.75;
        break;
      // TODO too ugly
      // case TextShadowStyle.OUTLINE:
      //   textDisplay.setShadow(0, 0, Colors.BLACK, 1, false);
      //   textDisplay.strokeThickness = 2;
      //   break;
      case TextShadowStyle.DROP:
        textDisplay.setShadow(1, 1, Colors.DARK_GREY, 1.5);
        textDisplay.strokeThickness = 1.25;
        break;
      default:
        break;
    }

    return textDisplay;
  }

  newTinyTelevisionBuilder() {
    return new TinyTelevisionBuilder(this.game, this.idGenerator);
  }
}

export default GraphicsFactory;
