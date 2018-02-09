import VisibilitySystem from './VisibilitySystem';
import Iterator from '../../../util/syntax/Iterator';
import Container from '../../../util/entityStorage/Container';
import {asSequence} from 'sequency';
import Entity from '../../Entity';
import Point from '../../../util/syntax/Point';

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
