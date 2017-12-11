import SettingsManager, {SettingsOption} from '../../interface/SettingsManager';
import {isLinux} from '../../util';

class LocalStorageSettingsManager implements SettingsManager {
  // TODO implement listener
  private static readonly DEFAULT_SETTINGS = {
    fontFamily: (isLinux()
        ? `'Noto Sans CJK SC DemiLight'`
        : `SimHei, 'Microsoft JhengHei', YaHei`) + ', Arial, Helvetica, sans-serif',
  };

  private settings: any;

  constructor(readonly fontFamilyChanged: Phaser.Signal<string>) {
    // TODO read settings from bilibili player
    this.settings = Object.assign({}, LocalStorageSettingsManager.DEFAULT_SETTINGS);
  }

  getSetting<T>(option: SettingsOption<T>): T {
    throw new Error('Method not implemented.'); // TODO
  }

  setSetting<T>(option: SettingsOption<T>, value: T): void {
    throw new Error('Method not implemented.');
  }
}

export default LocalStorageSettingsManager;
