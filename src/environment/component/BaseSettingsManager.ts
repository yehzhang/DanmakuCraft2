import SettingsManager, {
  SettingsOption, SettingsOptions,
  TextShadowStyle
} from '../interface/SettingsManager';
import {isLinux} from '../util';

abstract class BaseSettingsManager implements SettingsManager {
  private static readonly DEFAULT_SETTINGS: Map<SettingsOptions, any> = new Map()
      .set(SettingsOptions.FONT_FAMILY, (isLinux()
          ? `'Noto Sans CJK SC DemiLight'`
          : `SimHei, 'Microsoft JhengHei', YaHei`) + ', Arial, Helvetica, sans-serif')
      .set(SettingsOptions.TEXT_SHADOW, TextShadowStyle.GLOW);

  constructor(protected settings: Map<SettingsOptions, any> =
                  new Map(BaseSettingsManager.DEFAULT_SETTINGS)) {
    this.loadSettings();
  }

  getSetting<T>(option: SettingsOption<T>): T {
    let setting = this.settings.get(option);
    if (setting === undefined) {
      throw new TypeError('Unknown settings option');
    }
    return setting;
  }

  setSetting<T>(option: SettingsOption<T>, value: T): void {
    if (!this.settings.has(option)) {
      throw new TypeError('Unknown settings option');
    }
    this.settings.set(option, value);
  }

  protected abstract loadSettings(): void;
}

export default BaseSettingsManager;
