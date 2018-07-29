import {asSequence} from 'sequency';
import Container from '../../../util/dataStructures/Container';
import Iterator from '../../../util/syntax/Iterator';
import Point from '../../../util/syntax/Point';
import Entity from '../../Entity';
import VisibilitySystem from './VisibilitySystem';

class ContainerSystem<T extends Entity> implements VisibilitySystem<T>, Container<T> {
  constructor(private currentEntities: Set<T> = new Set()) {
  }

  get coordinates() {
    return asSequence(this.currentEntities)
        .map(entity => entity.coordinates)
        .fold(
            Point.origin(),
            (point, other) => point.setTo(Math.min(point.x, other.x), Math.min(point.y, other.y)));
  }

  enter(entity: T) {
    this.currentEntities.add(entity);
  }

  update() {
  }

  exit(entity: T) {
    this.currentEntities.delete(entity);
  }

  finish() {
  }

  [Symbol.iterator]() {
    return Iterator.of(this.currentEntities);
  }

  count() {
    return this.currentEntities.size;
  }
}

export default ContainerSystem;
