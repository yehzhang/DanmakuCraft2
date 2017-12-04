import TinyTelevisionBuilder from './TinyTelevisionBuilder';
import IdGenerator from '../../IdGenerator';

export default class GraphicsFactory {
  constructor(private game: Phaser.Game, private idGenerator: IdGenerator) {
  }

  newTinyTelevisionBuilder() {
    return new TinyTelevisionBuilder(this.game, this.idGenerator);
  }
}
