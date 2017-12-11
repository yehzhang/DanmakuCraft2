import TinyTelevisionBuilder from './TinyTelevisionBuilder';
import IdGenerator from '../../util/IdGenerator';
import SettingsManager, {SettingsOptions} from '../../environment/interface/SettingsManager';
import Comment from '../../entitySystem/component/Comment';

class GraphicsFactory {
  private fontFamily: string;

  constructor(
      private game: Phaser.Game,
      private idGenerator: IdGenerator,
      settingsManager: SettingsManager) {
    this.fontFamily = settingsManager.getSetting(SettingsOptions.FONT_FAMILY);
    settingsManager.fontFamilyChanged.add(this.onFontChanged, this);
  }

  createTextFromComment(comment: Comment): Phaser.Text {
    let color = Phaser.Color.getWebRGB(comment.color); // TODO test if works?
    let text = this.createText(comment.text, comment.size, color);
    text.anchor.setTo(0.5);
    return text;
  }

  createText(text: string, size: number, color: string): Phaser.Text {
    // TODO add font shadow
    return this.game.make.text(
        0,
        0,
        text,
        {
          font: this.fontFamily,
          fontSize: size,
          fill: color,
        });
  }

  newTinyTelevisionBuilder() {
    return new TinyTelevisionBuilder(this.game, this.idGenerator);
  }

  private onFontChanged(fontFamily: string) {
    if (this.fontFamily === fontFamily) {
      return;
    }

    this.fontFamily = fontFamily;
    // No need to redraw previously-drawn comments.
  }
}

export default GraphicsFactory;
