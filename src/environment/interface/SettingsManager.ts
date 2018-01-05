export class SettingsOption<T> {
}

export class SettingsOptions {
  static readonly FONT_FAMILY = new SettingsOption<string>();
  static readonly TEXT_SHADOW = new SettingsOption<TextShadowStyle>();
  static readonly TUTORIAL_ENABLED = new SettingsOption<boolean>(); // TODO implement tutorial
}

export enum TextShadowStyle {
  NONE,
  GLOW,
  OUTLINE,
  DROP,
}

/**
 * Provides and stores settings.
 */
interface SettingsManager {
  getSetting<T>(option: SettingsOption<T>): T;

  setSetting<T>(option: SettingsOption<T>, value: T): void;
}

export default SettingsManager;
