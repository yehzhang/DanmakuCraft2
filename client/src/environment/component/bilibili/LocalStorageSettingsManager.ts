import BaseSettingsManager from '../BaseSettingsManager';
import {PresetSettingsOptions, SettingsOption} from '../../interface/SettingsManager';
import TextShadowStyle from '../../../render/TextShadowStyle';

class LocalStorageSettingsManager extends BaseSettingsManager {
  private static readonly TEXT_SHADOW_STYLE_MAPPING = new Map()
      .set(0, TextShadowStyle.GLOW)
      .set(1, TextShadowStyle.OUTLINE)
      .set(2, TextShadowStyle.DROP);

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

  private static getPresetSettings(): { [key: string]: any } | null {
    if (!window.localStorage) {
      return null;
    }

    const playerSettings = localStorage.getItem('bilibili_player_settings');
    if (playerSettings == null) {
      return null;
    }

    const settingsConfig = JSON.parse(playerSettings).setting_config;
    if (settingsConfig == null) {
      return null;
    }

    return settingsConfig;
  }

  protected loadPresetSettings(presetSettings: Map<PresetSettingsOptions, any>) {
    const settings = LocalStorageSettingsManager.getPresetSettings();

    let fontFamily;
    if (settings && typeof settings['fontfamily'] === 'string') {
      fontFamily = settings['fontfamily'];
    } else {
      fontFamily = PresetSettingsOptions.FONT_FAMILY.getDefaultValue();
    }
    presetSettings.set(PresetSettingsOptions.FONT_FAMILY, fontFamily);

    let textShadowStyle = PresetSettingsOptions.TEXT_SHADOW.getDefaultValue();
    if (settings) {
      const textShadowStyleIndex = Number(settings['fontborder']);
      const parsedTextShadowStyle =
          LocalStorageSettingsManager.TEXT_SHADOW_STYLE_MAPPING.get(textShadowStyleIndex);
      if (parsedTextShadowStyle != null) {
        textShadowStyle = parsedTextShadowStyle;
      }
    }
    presetSettings.set(PresetSettingsOptions.TEXT_SHADOW, textShadowStyle);
  }
}

export default LocalStorageSettingsManager;
