import BaseSettingsManager from '../BaseSettingsManager';
import {PresetSettingsOptions, SettingsOption} from '../../interface/SettingsManager';
import TextShadowStyle from '../../../render/TextShadowStyle';

class LocalStorageSettingsManager extends BaseSettingsManager {
  protected loadSetting<T>(option: SettingsOption<T>): T {
    if (!window.localStorage) {
      throw new TypeError(`Failed to load setting '${option.toPublicOptionKey()}' because localStorage is not available`);
    }

    const item = localStorage.getItem(option.toPublicOptionKey());
    if (item == null) {
      return option.getDefaultValue();
    }
    return JSON.parse(item);
  }

  protected persistSetting<T>(option: SettingsOption<T>, value: T) {
    if (!window.localStorage) {
      console.error(`Failed to persist setting '${option.toPublicOptionKey()}' because localStorage is not available`);
      return;
    }
    localStorage.setItem(option.toPublicOptionKey(), JSON.stringify(value));
  }

  protected loadPresetSettings(presetSettings: Map<PresetSettingsOptions, any>) {
    if (!window.localStorage) {
      return;
    }

    const playerSettings = localStorage.getItem('bilibili_player_settings');
    if (playerSettings == null) {
      return;
    }

    const settingsConfig = JSON.parse(playerSettings).setting_config;
    if (settingsConfig == null) {
      return;
    }

    const fontFamily = settingsConfig['fontfamily'];
    if (fontFamily && fontFamily instanceof String) {
      presetSettings.set(PresetSettingsOptions.FONT_FAMILY, fontFamily);
    }

    const fontBorder = settingsConfig['fontborder'];
    if ((fontFamily && fontBorder instanceof String) || fontBorder instanceof Number) {
      const textShadowIndex = Number(fontBorder);
      const textShadowStyle = TextShadowStyle[textShadowIndex];
      if (textShadowStyle != null) {
        presetSettings.set(PresetSettingsOptions.TEXT_SHADOW, textShadowStyle);
      }
    }
  }
}

export default LocalStorageSettingsManager;
