import TinyTelevisionBuilder from './TinyTelevisionBuilder';
import IdGenerator from '../../IdGenerator';
import SettingsManager from '../../environment/SettingsManager';

export default class GraphicsFactory {
  private fontFamily: string;

  constructor(
      private game: Phaser.Game,
      private idGenerator: IdGenerator,
      settingsManager: SettingsManager) {
    this.fontFamily = settingsManager.getSetting(SettingsManager.Options.FONT_FAMILY);
    settingsManager.addEventListener(SettingsManager.Options.FONT_FAMILY, this.onFontChanged, this);
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
