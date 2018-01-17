import BaseSettingsManager from '../BaseSettingsManager';
import {SettingsOptions} from '../../interface/SettingsManager';
import TextShadowStyle from '../../../render/TextShadowStyle';

class LocalStorageSettingsManager extends BaseSettingsManager {
  protected loadSettings() {
    let playerSettings = localStorage.getItem('bilibili_player_settings');
    if (playerSettings == null) {
      return;
    }

    let settingsConfig = JSON.parse(playerSettings).setting_config;
    if (settingsConfig == null) {
      return;
    }

    let fontFamily = settingsConfig['fontfamily'];
    if (fontFamily && fontFamily instanceof String) {
      this.settings.set(SettingsOptions.FONT_FAMILY, fontFamily);
    }

    let fontBorder = settingsConfig['fontborder'];
    if ((fontFamily && fontBorder instanceof String) || fontBorder instanceof Number) {
      let textShadowIndex = Number(fontBorder);
      let textShadowStyle = TextShadowStyle[textShadowIndex];
      if (textShadowStyle != null) {
        this.settings.set(SettingsOptions.TEXT_SHADOW, textShadowStyle);
      }
    }
  }
}

export default LocalStorageSettingsManager;
