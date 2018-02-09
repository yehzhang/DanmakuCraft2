import EntityFinder, {StateChanged} from '../EntityFinder';
import Point from '../../syntax/Point';
import Quadtree from './Quadtree';
import Entity from '../../../entitySystem/Entity';
import {validateRadius} from '../../../law/space';
import Rectangle from '../../syntax/Rectangle';
import Iterator from '../../syntax/Iterator';
import {Region} from '../../../entitySystem/alias';
import PhysicalConstants from '../../../PhysicalConstants';

class QuadTreeEntityFinder<T extends Entity> implements EntityFinder<Region<T>> {
  constructor(
      private tree: Quadtree<T>,
      readonly onStateChanged: Phaser.Signal<StateChanged<Region<T>>>) {
  }

  listAround(coordinates: Point, radius: number) {
    validateRadius(radius);

    const bounds = Rectangle.inflateFrom(coordinates, radius);
    return this.tree.listLeavesIn(bounds);
  }

  [Symbol.iterator]() {
    const chunks = this.tree.listLeavesIn(Rectangle.sized(PhysicalConstants.WORLD_SIZE));
    return Iterator.of(chunks);
  }
}

export default QuadTreeEntityFinder;
