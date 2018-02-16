import {Phaser} from '../../util/alias/phaser';

interface BackgroundMusicPlayer {
  /**
   * @param {number} value in [0, 1].
   */
  setVolume(value: number): void;

  setSprite(sprite: Phaser.AudioSprite): void;

  start(): void;
}

export default BackgroundMusicPlayer;
