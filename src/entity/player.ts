import {Player} from './entity';

export class PlayerManager {
  // TODO spawn player
}

export class TinyTelevision extends Player {
  constructor(coordinate: Phaser.Point, game: Phaser.Game) {
    super(coordinate, game);
    this.craftDisplay();
  }

  tick(): void {
    throw new Error('Method not implemented.');
  }

  private craftDisplay() {
    throw new Error('Method not implemented.');
  }
}
