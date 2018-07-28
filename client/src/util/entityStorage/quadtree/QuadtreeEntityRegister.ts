import {asSequence} from 'sequency';
import {Region, StationaryEntity} from '../../../entitySystem/alias';
import Iterator from '../../syntax/Iterator';
import Provider from '../../syntax/Provider';
import {StateChanged} from '../EntityFinder';
import EntityRegister from '../EntityRegister';
import Quadtree from './Quadtree';

class QuadTreeEntityRegister<T extends StationaryEntity> implements EntityRegister<T> {
  constructor(
      private tree: Quadtree<T>,
      private onStateChanged: Phaser.Signal<StateChanged<T>>) {
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

  [Symbol.iterator]() {
    return Iterator.of(this.tree);
  }

  private dispatchUpdatesOfChunks(provider: Provider<[Iterable<Region<T>>, Iterable<Region<T>>]>) {
    const [addedChunks, removedChunks] =
        provider().map(chunks => asSequence(chunks).flatten().toArray());
    if (addedChunks.length > 0 || removedChunks.length > 0) {
      this.onStateChanged.dispatch(new StateChanged(addedChunks, removedChunks));
    }
  }
}

export default QuadTreeEntityRegister;
