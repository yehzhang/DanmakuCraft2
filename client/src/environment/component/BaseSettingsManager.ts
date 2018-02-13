import SettingsManager, {PresetSettingsOptions, SettingsOption} from '../interface/SettingsManager';
import {isLinux} from '../util';
import TextShadowStyle from '../../render/TextShadowStyle';

abstract class BaseSettingsManager implements SettingsManager {
  private static readonly DEFAULT_PRESET_SETTINGS: Map<PresetSettingsOptions, any> = new Map()
      .set(PresetSettingsOptions.FONT_FAMILY, (isLinux()
          ? `'Noto Sans CJK SC DemiLight'`
          : `SimHei, 'Microsoft JhengHei', YaHei`) + ', Arial, Helvetica, sans-serif')
      .set(PresetSettingsOptions.TEXT_SHADOW, TextShadowStyle.GLOW);

  constructor(private presetSettings: Map<PresetSettingsOptions, any> = new Map(BaseSettingsManager.DEFAULT_PRESET_SETTINGS)) {
    this.loadPresetSettings(presetSettings);
  }

  getSetting<T>(option: SettingsOption<T>): T {
    let setting = this.presetSettings.get(option);
    if (setting !== undefined) {
      return setting;
    }

    return this.loadSetting(option);
  }

  setSetting<T>(option: SettingsOption<T>, value: T): void {
    switch (option as any) {
      case PresetSettingsOptions.TEXT_SHADOW:
      case PresetSettingsOptions.FONT_FAMILY:
        throw new TypeError('Not implemented');
    }
    this.persistSetting(option, value);
  }

  protected abstract loadPresetSettings(presetSettings: Map<PresetSettingsOptions, any>): void;

  protected abstract loadSetting<T>(option: SettingsOption<T>): T;

  protected abstract persistSetting<T>(option: SettingsOption<T>, value: T): void;
}

export default BaseSettingsManager;
