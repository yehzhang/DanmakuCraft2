import Entity from '../../../entitySystem/Entity';
import {validateRadius} from '../../../law/space';
import PhysicalConstants from '../../../PhysicalConstants';
import Iterator from '../../syntax/Iterator';
import Point from '../../syntax/Point';
import Rectangle from '../../syntax/Rectangle';
import EntityFinder, {StateChanged} from '../EntityFinder';
import Quadtree from './Quadtree';

class QuadTreeEntityFinder<T extends Entity> implements EntityFinder<T> {
  constructor(
      private tree: Quadtree<T>,
      readonly onStateChanged: Phaser.Signal<StateChanged<T>>) {
  }

  listAround(coordinates: Point, radius: number) {
    validateRadius(radius);

    const bounds = Rectangle.inflateFrom(coordinates, radius);
    return this.tree.listIn(bounds);
  }

  [Symbol.iterator]() {
    const entities = this.tree.listIn(Rectangle.sized(PhysicalConstants.WORLD_SIZE));
    return Iterator.of(entities);
  }
}

export default QuadTreeEntityFinder;
