import BackgroundMusicPlayer from './BackgroundMusicPlayer';
import {Phaser} from '../../util/alias/phaser';
import Sleep from '../../util/async/Sleep';

class BackgroundMusicPlayerImpl implements BackgroundMusicPlayer {
  constructor(
      private timer: Phaser.Timer,
      private sprite: Phaser.AudioSprite | null = null,
      private volume: number = 1,
      private isStarted: boolean = false,
      private currentSound: Phaser.Sound | null = null) {
  }

  private static shuffle<T>(tracks: T[]) {
    if (tracks.length <= 1) {
      return;
    }

    const firstTrack = Phaser.ArrayUtils.removeRandomItem(tracks, 0, tracks.length - 1);
    Phaser.ArrayUtils.shuffle(tracks);
    tracks.unshift(firstTrack);
  }

  setVolume(value: number) {
    this.volume = value;

    if (this.currentSound == null) {
      return;
    }
    this.currentSound.volume = value;
  }

  setSprite(sprite: Phaser.AudioSprite) {
    if (sprite.config.trackKeys.length === 0) {
      throw new TypeError('Music tracks are empty');
    }

    if (this.sprite != null) {
      throw new TypeError('Sprite is already set');
    }

    this.sprite = sprite;
  }

  async start() {
    if (this.sprite == null) {
      throw new TypeError('Sprite is not available');
    }

    if (this.isStarted) {
      return;
    }
    this.isStarted = true;

    const trackKeys = Array.from<string>(this.sprite.config.trackKeys);
    await this.playInitialRoundOfTracks(trackKeys);
    return this.loopTracks(trackKeys);
  }

  private async playInitialRoundOfTracks(trackKeys: string[]) {
    let pauseDuration = __DEV__ ? 0 : Phaser.Timer.MINUTE;
    for (const trackKey of trackKeys) {
      await new Promise(resolve => this.timer.add(pauseDuration, resolve));

      await this.play(trackKey);

      const pauseDurationIncrement = __DEV__ ? 0 : Math.random() * Phaser.Timer.MINUTE;
      pauseDuration = Math.min(pauseDuration + pauseDurationIncrement, 2 * Phaser.Timer.MINUTE);
    }
  }

  private async loopTracks(trackKeys: string[]) {
    // noinspection InfiniteLoopJS
    while (true) {
      BackgroundMusicPlayerImpl.shuffle(trackKeys);
      for (const trackKey of trackKeys) {
        await Sleep.after((Math.random() + 1.5) * Phaser.Timer.MINUTE);
        await this.play(trackKey);
      }
    }
  }

  private async play(trackKey: string) {
    this.currentSound = (this.sprite as Phaser.AudioSprite).play(trackKey, this.volume);

    const currentSound = this.currentSound;
    await new Promise(resolve => currentSound.onStop.addOnce(resolve));

    this.currentSound = null;
  }
}

export default BackgroundMusicPlayerImpl;
