import {asSequence} from 'sequency';
import {Region} from '../../../entitySystem/alias';
import ImmutableCoordinates from '../../../entitySystem/component/ImmutableCoordinates';
import Entity from '../../../entitySystem/Entity';
import {toWorldBounds} from '../../../law/space';
import PhysicalConstants from '../../../PhysicalConstants';
import {leftOuterJoin} from '../../set';
import Consumer from '../../syntax/Consumer';
import Iterator from '../../syntax/Iterator';
import Point from '../../syntax/Point';
import Rectangle from '../../syntax/Rectangle';
import ImmutableContainer from '../ImmutableContainer';

class Quadtree<T extends Entity> implements Iterable<T> {
  constructor(private root: Tree<T>) {
  }

  static empty<T extends Entity>(maxValuesCount: number, maxDepth: number): Quadtree<T> {
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
        .asIterable();
  }

  add(value: T): [Iterable<Region<T>>, Iterable<Region<T>>] {
    return this.collectUpdatesOfLeaves((addedLeaves, removedLeaves) => {
      this.root = this.root.add(value, addedLeaves, removedLeaves);
    });
  }

  addBatch(values: Iterable<T>): [Iterable<Region<T>>, Iterable<Region<T>>] {
    return this.collectUpdatesOfLeaves((addedLeaves, removedLeaves) => {
      for (const value of values) {
        this.root = this.root.add(value, addedLeaves, removedLeaves);
      }
    });
  }

  remove(value: T): [Iterable<Region<T>>, Iterable<Region<T>>] {
    return this.collectUpdatesOfLeaves((addedLeaves, removedLeaves) => {
      this.root = this.root.remove(value, addedLeaves, removedLeaves);
    });
  }

  private collectUpdatesOfLeaves(
      callback: (
          addedLeaves: Set<Leaf<T>>,
          removedLeaves: Set<Leaf<T>>) => void): [Iterable<Region<T>>, Iterable<Region<T>>] {
    const addedLeaves: Set<Leaf<T>> = new Set();
    const removedLeaves: Set<Leaf<T>> = new Set();

    callback(addedLeaves, removedLeaves);

    const filteredAddedLeaves = leftOuterJoin(addedLeaves, removedLeaves);
    const filteredRemovedLeaves = leftOuterJoin(removedLeaves, addedLeaves);

    return [filteredAddedLeaves, filteredRemovedLeaves];
  }

  [Symbol.iterator]() {
    return Iterator.of(this.root);
  }
}

export default Quadtree;

export interface Tree<T extends Entity> extends ImmutableContainer<T> {
  listIn(bounds: Rectangle): Iterable<T>;

  add(value: T, addedLeaves?: Set<Leaf<T>>, removedLeaves?: Set<Leaf<T>>): Tree<T>;

  remove(value: T, addedLeaves?: Set<Leaf<T>>, removedLeaves?: Set<Leaf<T>>): Tree<T>;
}

export class Node<T extends Entity> implements Tree<T> {
  /**
   * @param {Array<Tree<T>>} children [topLeft, topRight, bottomLeft, bottomRight]
   * @param {Rectangle} bounds
   */
  constructor(private children: Array<Tree<T>>, private bounds: Rectangle) {
    if (children.length !== 4) {
      throw new TypeError('Invalid number of children');
    }
  }

  count() {
    return asSequence(this.children).map(child => child.count()).sum();
  }

  listIn(bounds: Rectangle) {
    if (!this.bounds.intersects(bounds)) {
      return [];
    }

    bounds = bounds.clone();
    return asSequence(this.children)
        .map(tree => tree.listIn(bounds))
        .flatten()
        .asIterable();
  }

  add(value: T, addedLeaves?: Set<Leaf<T>>, removedLeaves?: Set<Leaf<T>>): Tree<T> {
    this.applyValueToChild(value, child => child.add(value, addedLeaves, removedLeaves));
    return this;
  }

  remove(value: T, addedLeaves?: Set<Leaf<T>>, removedLeaves?: Set<Leaf<T>>): Tree<T> {
    this.applyValueToChild(value, child => child.remove(value, addedLeaves, removedLeaves));
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

export class Leaf<T extends Entity> extends ImmutableCoordinates implements Tree<T> {
  constructor(
      private bounds: Rectangle,
      private maxDepth: number,
      private maxValuesCount: number,
      private depth: number = 0,
      private values: Set<T> = new Set()) {
    super(Point.of(bounds.centerX, bounds.centerY));
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
        .asIterable();
  }

  add(value: T, addedLeaves?: Set<Leaf<T>>, removedLeaves?: Set<Leaf<T>>): Tree<T> {
    if (this.values.has(value)) {
      return this;
    }

    if (this.values.size < this.maxValuesCount || this.depth === this.maxDepth) {
      return this.cloneModified(values => values.add(value), addedLeaves, removedLeaves);
    }

    return this.asNode(addedLeaves, removedLeaves).add(value, addedLeaves, removedLeaves);
  }

  remove(value: T, addedLeaves?: Set<Leaf<T>>, removedLeaves?: Set<Leaf<T>>): Tree<T> {
    if (!this.values.has(value)) {
      return this;
    }
    return this.cloneModified(values => values.delete(value), addedLeaves, removedLeaves);
  }

  count() {
    return this.values.size;
  }

  [Symbol.iterator]() {
    return Iterator.of(this.values);
  }

  private asNode(addedLeaves?: Set<Leaf<T>>, removedLeaves?: Set<Leaf<T>>): Tree<T> {
    const quartileBounds = this.bounds.clone().scale(0.5);
    const topRight = this.newChildLeaf<T>(quartileBounds.clone().offset(quartileBounds.width, 0));
    const bottomLeft =
        this.newChildLeaf<T>(quartileBounds.clone().offset(0, quartileBounds.height));
    const bottomRight = this.newChildLeaf<T>(
        quartileBounds.clone().offset(quartileBounds.width, quartileBounds.height));
    const topLeft = this.newChildLeaf<T>(quartileBounds);

    let node: Tree<T> = new Node([topLeft, topRight, bottomLeft, bottomRight], this.bounds);
    for (const value of this.values) {
      node = node.add(value, addedLeaves, removedLeaves);
    }

    if (addedLeaves) {
      addedLeaves.add(topLeft);
      addedLeaves.add(topRight);
      addedLeaves.add(bottomLeft);
      addedLeaves.add(bottomRight);
    }
    if (removedLeaves) {
      removedLeaves.add(this);
    }

    return node;
  }

  private cloneModified(
      valuesModifier: Consumer<Set<T>>,
      addedLeaves?: Set<Leaf<T>>,
      removedLeaves?: Set<Leaf<T>>) {
    const newValues = new Set(this.values);
    valuesModifier(newValues);

    const newLeaf =
        new Leaf(this.bounds, this.maxDepth, this.maxValuesCount, this.depth, newValues);

    if (addedLeaves) {
      addedLeaves.add(newLeaf);
    }
    if (removedLeaves) {
      removedLeaves.add(this);
    }

    return newLeaf;
  }

  private newChildLeaf<U extends Entity>(bounds: Rectangle): Leaf<U> {
    return new Leaf(bounds, this.maxDepth, this.maxValuesCount, this.depth + 1);
  }
}
