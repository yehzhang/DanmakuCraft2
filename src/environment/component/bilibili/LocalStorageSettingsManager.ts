import SettingsManager, {
  SettingsOption, SettingsOptions,
  TextShadowStyle
} from '../../interface/SettingsManager';
import {isLinux} from '../../util';

class LocalStorageSettingsManager implements SettingsManager {
  private static readonly DEFAULT_SETTINGS: Map<SettingsOptions, any> = new Map()
      .set(SettingsOptions.FONT_FAMILY, (isLinux()
          ? `'Noto Sans CJK SC DemiLight'`
          : `SimHei, 'Microsoft JhengHei', YaHei`) + ', Arial, Helvetica, sans-serif')
      .set(SettingsOptions.TEXT_SHADOW, TextShadowStyle.GLOW);

  constructor(private settings: Map<SettingsOptions, any> =
                  new Map(LocalStorageSettingsManager.DEFAULT_SETTINGS)) {
    // TODO read settings from bilibili player
  }

  // TODO refactor to base settings manager
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
}

export default LocalStorageSettingsManager;
