import {StationaryEntity} from '../../entitySystem/alias';
import {toWorldBounds} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import {Collector} from '../entityStorage/EntityFinder';
import Rectangle from '../syntax/Rectangle';

class Quadtree<T extends StationaryEntity> implements Iterable<T> {
  constructor(private root: Tree<T>) {
  }

  static create<T extends StationaryEntity>(maxValuesCount: number, maxDepth: number): Quadtree<T> {
    const bounds = Rectangle.sized(PhysicalConstants.WORLD_SIZE);
    const root = new Leaf<T>(bounds, maxDepth, maxValuesCount);
    return new Quadtree(root);
  }

  collectIn(bounds: Rectangle, collector: Collector<T>) {
    bounds = toWorldBounds(bounds, PhysicalConstants.WORLD_SIZE);
    this.root.collectIn(bounds, collector);
    this.root.collectIn(bounds.offset(-PhysicalConstants.WORLD_SIZE, 0), collector);
    this.root.collectIn(bounds.offset(0, -PhysicalConstants.WORLD_SIZE), collector);
    this.root.collectIn(bounds.offset(PhysicalConstants.WORLD_SIZE, 0), collector);
  }

  /**
   * @return values added.
   */
  add(value: T): T[] {
    const addedValues: T[] = [];
    this.root = this.root.add(value, addedValues);

    return addedValues;
  }

  /**
   * @return values added.
   */
  addBatch(values: Iterable<T>): T[] {
    const addedValues: T[] = [];
    for (const value of values) {
      this.root = this.root.add(value, addedValues);
    }

    return addedValues;
  }

  /**
   * @return values removed.
   */
  remove(value: T): T[] {
    const removedValues: T[] = [];
    this.root = this.root.remove(value, removedValues);

    return removedValues;
  }

  * [Symbol.iterator]() {
    yield* this.root;
  }
}

export default Quadtree;

export interface Tree<T extends StationaryEntity> extends Iterable<T> {
  collectIn(bounds: Rectangle, collector: Collector<T>): void;

  collectAll(collector: Collector<T>): void;

  add(value: T, addedValues?: T[]): Tree<T>;

  remove(value: T, removedValues?: T[]): Tree<T>;
}

export class Node<T extends StationaryEntity> implements Tree<T> {
  constructor(
      private topLeftChild: Tree<T>,
      private topRightChild: Tree<T>,
      private bottomLeftChild: Tree<T>,
      private bottomRightChild: Tree<T>,
      private readonly bounds: Rectangle) {
  }

  collectIn(bounds: Rectangle, collector: Collector<T>) {
    if (!this.bounds.intersects(bounds)) {
      return;
    }

    if (bounds.containsRect(this.bounds)) {
      this.collectAll(collector);
      return;
    }

    this.topLeftChild.collectIn(bounds, collector);
    this.topRightChild.collectIn(bounds, collector);
    this.bottomLeftChild.collectIn(bounds, collector);
    this.bottomRightChild.collectIn(bounds, collector);
  }

  add(value: T, addedValues?: T[]): Tree<T> {
    this.applyValueToChild(value, child => child.add(value, addedValues));
    return this;
  }

  remove(value: T, removedValues?: T[]): Tree<T> {
    this.applyValueToChild(value, child => child.remove(value, removedValues));
    return this;
  }

  collectAll(collector: Collector<T>) {
    this.topLeftChild.collectAll(collector);
    this.topRightChild.collectAll(collector);
    this.bottomLeftChild.collectAll(collector);
    this.bottomRightChild.collectAll(collector);
  }

  * [Symbol.iterator]() {
    yield* this.topLeftChild;
    yield* this.topRightChild;
    yield* this.bottomLeftChild;
    yield* this.bottomRightChild;
  }

  private applyValueToChild(value: T, callback: (child: Tree<T>) => Tree<T>) {
    if (!this.bounds.contains(value.coordinates.x, value.coordinates.y)) {
      return;
    }

    const isOnTheRight = value.coordinates.x >= this.bounds.centerX;
    const isOnTheBottom = value.coordinates.y >= this.bounds.centerY;
    if (isOnTheBottom) {
      if (isOnTheRight) {
        this.bottomRightChild = callback(this.bottomRightChild);
      } else {
        this.bottomLeftChild = callback(this.bottomLeftChild);
      }
    } else {
      if (isOnTheRight) {
        this.topRightChild = callback(this.topRightChild);
      } else {
        this.topLeftChild = callback(this.topLeftChild);
      }
    }
  }
}

export class Leaf<T extends StationaryEntity> implements Tree<T> {
  constructor(
      private readonly bounds: Rectangle,
      private readonly maxDepth: number,
      private readonly maxValuesCount: number,
      private readonly depth: number = 0,
      private readonly values: T[] = []) {
    if (!(maxValuesCount > 0)) {
      throw new TypeError(`Invalid 'maxValuesCount'`);
    }
  }

  collectIn(bounds: Rectangle, collector: Collector<T>) {
    if (!this.bounds.intersects(bounds)) {
      return;
    }
    for (const value of this.values) {
      const coordinates = value.coordinates;
      if (!bounds.contains(coordinates.x, coordinates.y)) {
        return;
      }

      collector.add(value);
    }
  }

  add(value: T, addedValues?: T[]): Tree<T> {
    if (this.values.includes(value)) {
      return this;
    }

    if (this.values.length >= this.maxValuesCount && this.depth !== this.maxDepth) {
      return this.asNode().add(value, addedValues);
    }

    this.values.push(value);

    if (addedValues) {
      addedValues.push(value);
    }

    return this;
  }

  remove(value: T, removedValues?: T[]) {
    const valueIndex = this.values.indexOf(value);
    if (valueIndex === -1) {
      return this;
    }

    this.values.splice(valueIndex, 1);

    if (removedValues) {
      removedValues.push(value);
    }

    return this;
  }

  collectAll(collector: Collector<T>) {
    for (const value of this.values) {
      collector.add(value);
    }
  }

  * [Symbol.iterator]() {
    yield* this.values;
  }

  private asNode(): Tree<T> {
    const quartileBounds = this.bounds.clone().scale(0.5);
    const topLeft = this.newChildLeaf<T>(quartileBounds);
    const topRight = this.newChildLeaf<T>(quartileBounds.clone().offset(quartileBounds.width, 0));
    const bottomLeft =
        this.newChildLeaf<T>(quartileBounds.clone().offset(0, quartileBounds.height));
    const bottomRight = this.newChildLeaf<T>(
        quartileBounds.clone().offset(quartileBounds.width, quartileBounds.height));

    let node: Tree<T> = new Node(topLeft, topRight, bottomLeft, bottomRight, this.bounds);
    for (const value of this.values) {
      node = node.add(value);
    }

    return node;
  }

  private newChildLeaf<U extends StationaryEntity>(bounds: Rectangle): Leaf<U> {
    return new Leaf(bounds, this.maxDepth, this.maxValuesCount, this.depth + 1);
  }
}
