import TextShadowStyle from '../../../render/TextShadowStyle';
import {PresetSettingsOptions, SettingsOption} from '../../interface/SettingsManager';
import BaseSettingsManager from '../BaseSettingsManager';

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
    const settings = getPresetSettings();
    if (!settings) {
      return;
    }

    if (typeof settings['fontfamily'] === 'string') {
      presetSettings.set(PresetSettingsOptions.FONT_FAMILY, settings['fontfamily']);
    }

    const textShadowStyleIndex = Number(settings['fontborder']);
    const textShadowStyle = TEXT_SHADOW_STYLE_MAPPING.get(textShadowStyleIndex);
    if (textShadowStyle) {
      presetSettings.set(PresetSettingsOptions.TEXT_SHADOW, textShadowStyle);
    }
  }
}

const TEXT_SHADOW_STYLE_MAPPING = new Map()
    .set(0, TextShadowStyle.GLOW)
    .set(1, TextShadowStyle.OUTLINE)
    .set(2, TextShadowStyle.DROP);

function getPresetSettings(): { [key: string]: any } | null {
  if (!window.localStorage) {
    return null;
  }

  const playerSettings = localStorage.getItem('bilibili_player_settings');
  if (playerSettings == null) {
    return null;
  }

  const settingsConfig = JSON.parse(playerSettings)['setting_config'];
  if (settingsConfig == null) {
    return null;
  }

  return settingsConfig;
}

export default LocalStorageSettingsManager;
