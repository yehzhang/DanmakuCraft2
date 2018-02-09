import EntityRegister from '../EntityRegister';
import Quadtree from './Quadtree';
import {Region, StationaryEntity} from '../../../entitySystem/alias';
import {StateChanged} from '../EntityFinder';
import Iterator from '../../syntax/Iterator';
import Provider from '../../syntax/Provider';

class QuadTreeEntityRegister<T extends StationaryEntity> implements EntityRegister<T> {
  constructor(
      private tree: Quadtree<T>,
      private onStateChanged: Phaser.Signal<StateChanged<Region<T>>>) {
  }

  register(entity: T) {
    this.dispatchUpdatesOfChunks(() => this.tree.add(entity));
  }

  registerBatch(entities: Iterable<T>) {
    this.dispatchUpdatesOfChunks(() => this.tree.addBatch(entities));
  }

  deregister(entity: T) {
    this.dispatchUpdatesOfChunks(() => this.tree.remove(entity));
  }

  private dispatchUpdatesOfChunks(provider: Provider<[Iterable<Region<T>>, Iterable<Region<T>>]>) {
    const [addedChunks, removedChunks] = provider().map(chunks => Array.from(chunks));
    if (addedChunks.length > 0 || removedChunks.length > 0) {
      this.onStateChanged.dispatch(new StateChanged(addedChunks, removedChunks));
    }
  }

  [Symbol.iterator]() {
    return Iterator.of(this.tree);
  }
}

export default QuadTreeEntityRegister;
