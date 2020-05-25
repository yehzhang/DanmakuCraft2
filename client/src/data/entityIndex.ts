import RBush from 'rbush';
import { BoundingBox } from './boundingBox';

export interface EntityIndex<T> {
  load(entities: readonly EntityIndexNode<T>[]): EntityIndex<T>;

  search(area: BoundingBox): EntityIndexNode<T>[];
}

export interface EntityIndexNode<T> extends BoundingBox {
  /** ID that is unique to each index. */
  readonly id: string;
  readonly entity: T;
}

export class RBushEntityIndex<T> {
  constructor(private readonly data = new RBush<EntityIndexNode<T>>()) {}

  search(area: BoundingBox) {
    return this.data.search(area);
  }

  load(entities: readonly EntityIndexNode<T>[]) {
    this.data.load(entities);
    return new RBushEntityIndex(this.data);
  }
}
