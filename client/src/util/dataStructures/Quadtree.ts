import {asSequence} from 'sequency';
import {StationaryEntity} from '../../entitySystem/alias';
import {toWorldBounds} from '../../law/space';
import PhysicalConstants from '../../PhysicalConstants';
import Iterator from '../syntax/Iterator';
import Point from '../syntax/Point';
import Rectangle from '../syntax/Rectangle';

class Quadtree<T extends StationaryEntity> implements Iterable<T> {
  constructor(private root: Tree<T>) {
  }

  static empty<T extends StationaryEntity>(maxValuesCount: number, maxDepth: number): Quadtree<T> {
    const bounds = Rectangle.sized(PhysicalConstants.WORLD_SIZE);
    const root = new Leaf<T>(bounds, maxDepth, maxValuesCount);
    return new this(root);
  }

  listIn(bounds: Rectangle): Iterable<T> {
    bounds = toWorldBounds(bounds, PhysicalConstants.WORLD_SIZE);
    return asSequence([
      this.root.listIn(bounds),
      this.root.listIn(bounds.offset(-PhysicalConstants.WORLD_SIZE, 0)),
      this.root.listIn(bounds.offset(0, -PhysicalConstants.WORLD_SIZE)),
      this.root.listIn(bounds.offset(PhysicalConstants.WORLD_SIZE, 0))])
        .flatten()
        .toArray();
  }

  add(value: T) {
    const addedValues: T[] = [];
    this.root = this.root.add(value, addedValues);

    return addedValues;
  }

  addBatch(values: Iterable<T>): T[] {
    const addedValues: T[] = [];
    for (const value of values) {
      this.root = this.root.add(value, addedValues);
    }

    return addedValues;
  }

  remove(value: T) {
    const removedValues: T[] = [];
    this.root = this.root.remove(value, removedValues);

    return removedValues;
  }

  [Symbol.iterator]() {
    return Iterator.of(this.root);
  }
}

export default Quadtree;

export interface Tree<T extends StationaryEntity> extends Iterable<T> {
  listIn(bounds: Rectangle): Iterable<T>;

  add(value: T, addedValues?: T[]): Tree<T>;

  remove(value: T, removedValues?: T[]): Tree<T>;
}

export class Node<T extends StationaryEntity> implements Tree<T> {
  /**
   * @param {Array<Tree<T>>} children [topLeft, topRight, bottomLeft, bottomRight]
   * @param {Rectangle} bounds
   */
  constructor(private readonly children: Array<Tree<T>>, private readonly bounds: Rectangle) {
    if (children.length !== 4) {
      throw new TypeError('Invalid number of children');
    }
  }

  listIn(bounds: Rectangle) {
    if (!this.bounds.intersects(bounds)) {
      return [];
    }
    return asSequence(this.children)
        .map(tree => tree.listIn(bounds))
        .flatten()
        .toArray();
  }

  add(value: T, addedValues?: T[]): Tree<T> {
    this.applyValueToChild(value, child => child.add(value, addedValues));
    return this;
  }

  remove(value: T, removedValues?: T[]): Tree<T> {
    this.applyValueToChild(value, child => child.remove(value, removedValues));
    return this;
  }

  [Symbol.iterator]() {
    const values = asSequence(this.children).flatten().asIterable();
    return Iterator.of(values);
  }

  private applyValueToChild(value: T, callback: (child: Tree<T>) => Tree<T>) {
    const coordinates = value.coordinates;
    if (!this.bounds.contains(coordinates.x, coordinates.y)) {
      return;
    }

    const childIndex = this.getIndexOfChildContaining(coordinates);
    this.children[childIndex] = callback(this.children[childIndex]);
  }

  private getIndexOfChildContaining(coordinates: Point) {
    const isOnTheRight = coordinates.x >= this.bounds.centerX;
    const isOnTheBottom = coordinates.y >= this.bounds.centerY;
    return Number(isOnTheRight) + Number(isOnTheBottom) * 2;
  }
}

export class Leaf<T extends StationaryEntity> implements Tree<T> {
  constructor(
      private readonly bounds: Rectangle,
      private readonly maxDepth: number,
      private readonly maxValuesCount: number,
      private readonly depth: number = 0,
      private readonly values: Set<T> = new Set()) {
    if (!(maxValuesCount > 0)) {
      throw new TypeError(`Invalid 'maxValuesCount'`);
    }
  }

  listIn(bounds: Rectangle) {
    if (this.values.size === 0) {
      return [];
    }
    if (!this.bounds.intersects(bounds)) {
      return [];
    }
    return asSequence(this)
        .filter(value => {
          const coordinates = value.coordinates;
          return bounds.contains(coordinates.x, coordinates.y);
        })
        .toArray();
  }

  add(value: T, addedValues?: T[]): Tree<T> {
    if (this.values.has(value)) {
      return this;
    }

    if (this.values.size >= this.maxValuesCount && this.depth !== this.maxDepth) {
      return this.asNode().add(value, addedValues);
    }

    this.values.add(value);

    if (addedValues) {
      addedValues.push(value);
    }

    return this;
  }

  remove(value: T, removedValues?: T[]) {
    if (!this.values.has(value)) {
      return this;
    }

    this.values.delete(value);

    if (removedValues) {
      removedValues.push(value);
    }

    return this;
  }

  [Symbol.iterator]() {
    return Iterator.of(this.values);
  }

  private asNode(): Tree<T> {
    const quartileBounds = this.bounds.clone().scale(0.5);
    const topRight = this.newChildLeaf<T>(quartileBounds.clone().offset(quartileBounds.width, 0));
    const bottomLeft =
        this.newChildLeaf<T>(quartileBounds.clone().offset(0, quartileBounds.height));
    const bottomRight = this.newChildLeaf<T>(
        quartileBounds.clone().offset(quartileBounds.width, quartileBounds.height));
    const topLeft = this.newChildLeaf<T>(quartileBounds);

    let node: Tree<T> = new Node([topLeft, topRight, bottomLeft, bottomRight], this.bounds);
    for (const value of this.values) {
      node = node.add(value);
    }

    return node;
  }

  private newChildLeaf<U extends StationaryEntity>(bounds: Rectangle): Leaf<U> {
    return new Leaf(bounds, this.maxDepth, this.maxValuesCount, this.depth + 1);
  }
}
