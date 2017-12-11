import {UuidGenerator} from '../../util/IdGenerator';

export class SettingsOption<T> {
  readonly key: string;

  constructor() {
    this.key = UuidGenerator.generateUniqueId();
  }
}

export class SettingsOptions {
  static readonly FONT_FAMILY = new SettingsOption<string>();
  static readonly TUTORIAL_ENABLED = new SettingsOption<boolean>();
}

/**
 * Provides and stores settings, and dispatches a Phaser.Signal when settings is changed.
 */
interface SettingsManager {
  readonly fontFamilyChanged: Phaser.Signal<string>;

  getSetting<T>(option: SettingsOption<T>): T;

  setSetting<T>(option: SettingsOption<T>, value: T): void;
}

export default SettingsManager;
