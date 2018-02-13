import TextShadowStyle from '../../render/TextShadowStyle';

export class SettingsOption<T> {
  constructor();
  constructor(optionName: string, defaultValue: T);
  constructor(private optionName?: string, private defaultValue?: T) {
  }

  getName() {
    if (this.optionName == null) {
      throw new TypeError('This option is nameless');
    }
    return this.optionName;
  }

  toPublicOptionKey() {
    return `danmakucraft_settings_${this.getName()}`;
  }

  getDefaultValue() {
    if (this.defaultValue == null) {
      throw new TypeError('Default value is not specified');
    }
    return this.defaultValue;
  }
}

export class PresetSettingsOptions {
  static readonly FONT_FAMILY = new SettingsOption<string>();
  static readonly TEXT_SHADOW = new SettingsOption<TextShadowStyle>();
}

/**
 * Provides and stores settings.
 */
interface SettingsManager {
  getSetting<T>(option: SettingsOption<T>): T;

  setSetting<T>(option: SettingsOption<T>, value: T): void;
}

export default SettingsManager;
