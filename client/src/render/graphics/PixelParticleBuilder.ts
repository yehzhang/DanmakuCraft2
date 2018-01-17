import GraphicsBuilder from './GraphicsBuilder';
import Graphics from './Graphics';
import {Phaser} from '../../util/alias/phaser';

class PixelParticleBuilder extends GraphicsBuilder<number> {
  constructor(
      game: Phaser.Game,
      idGenerator: Phaser.RandomDataGenerator,
      private color: number,
      private size: number) {
    super(game, idGenerator);
  }

  protected getDrawer(index: number) {
    if (index !== 0) {
      throw new TypeError('Invalid frame index');
    }
    return this.draw.bind(this);
  }

  private draw(graphics: Graphics) {
    graphics
        .beginFill(this.color)
        .drawRoundedRect(0, 0, this.size, this.size, this.size / 3)
        .endFill();
  }
}

export default PixelParticleBuilder;
