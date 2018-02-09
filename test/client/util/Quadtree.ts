import {anything, deepEqual, instance, mock, verify, when} from 'ts-mockito';
import Entity from '../../../client/src/entitySystem/Entity';
import {expect} from 'chai';
import Quadtree, {Leaf, Node} from '../../../client/src/util/entityStorage/quadtree/Quadtree';
import Rectangle from '../../../client/src/util/syntax/Rectangle';
import Point from '../../../client/src/util/syntax/Point';
import {leftOuterJoin} from '../../../client/src/util/set';
import chai = require('chai');
import chaiShallowDeepEqual = require('chai-shallow-deep-equal');

chai.use(chaiShallowDeepEqual);

describe('Quadtree.Leaf', () => {
  let mockEntities: Entity[];
  let entities: Entity[];
  let leaf: Leaf<Entity>;

  beforeEach(() => {
    mockEntities = [mock(Entity), mock(Entity), mock(Entity)];
    entities = mockEntities.map(instance);

    when(mockEntities[0].coordinates).thenReturn(Point.origin());
    when(mockEntities[1].coordinates).thenReturn(Point.of(50, 0));
    when(mockEntities[2].coordinates).thenReturn(Point.of(50, 0));

    leaf = new Leaf(Rectangle.sized(100), 1, 1);
  });

  it('listLeavesIn() should return itself if it is in the bounds.', () => {
    const leaves1 = leaf.add(entities[0]).listLeavesIn(Rectangle.sized(1));
    expect(leaves1).to.shallowDeepEqual([leaf]);

    const leaves2 = leaf.listLeavesIn(Rectangle.empty());
    expect(leaves2).to.deep.equal([]);
  });

  it('add() should return a new leaf containing the added value.', () => {
    const newLeaf = leaf.add(entities[0]) as Leaf<Entity>;

    expect(newLeaf).not.to.equal(leaf);
    expect(newLeaf['values']).to.deep.equal(new Set([entities[0]]));
    expect(newLeaf['maxDepth']).to.equal(1);
    expect(newLeaf['maxValuesCount']).to.equal(1);
    expect(newLeaf['depth']).to.equal(0);
    expect(newLeaf['bounds']).to.deep.equal(Rectangle.sized(100));
  });

  it('add() should not modify the leaf itself.', () => {
    leaf.add(entities[0]);

    expect(leaf['values']).to.deep.equal(new Set());
    expect(leaf['maxDepth']).to.equal(1);
    expect(leaf['maxValuesCount']).to.equal(1);
    expect(leaf['depth']).to.equal(0);
    expect(leaf['bounds']).to.deep.equal(Rectangle.sized(100));
  });

  it('add() should lift as a node if there are more entities than a leaf could contain.', () => {
    const node = leaf.add(entities[0]).add(entities[1]) as Node<Entity>;

    expect(node['bounds']).to.deep.equal(Rectangle.sized(100));
    expect(node['children'].length).to.equal(4);

    const leaves = node['children'] as Array<Leaf<Entity>>;
    expect(leaves[0]['bounds']).to.shallowDeepEqual(Rectangle.sized(50));
    expect(leaves[1]['bounds']).to.shallowDeepEqual(Rectangle.of(50, 0, 50, 50));
    expect(leaves[2]['bounds']).to.shallowDeepEqual(Rectangle.of(0, 50, 50, 50));
    expect(leaves[3]['bounds']).to.shallowDeepEqual(Rectangle.of(50, 50, 50, 50));
    expect(leaves[0]['depth']).to.equal(1);
    expect(leaves[0]['maxDepth']).to.equal(1);
    expect(leaves[0]['maxValuesCount']).to.equal(1);
    expect(leaves[0]['values']).to.deep.equal(new Set([entities[0]]));
    expect(leaves[1]['values']).to.deep.equal(new Set([entities[1]]));
  });

  it('add() should not replace leaves if the entity is already added.', () => {
    const node1 = leaf.add(entities[0]);
    const node2 = node1.add(entities[0]);

    expect(node1).to.equal(node2);
  });

  it('add() should keep created leaves.', () => {
    let addedLeaves: Set<Leaf<Entity>> = new Set();
    const newLeaf = leaf.add(entities[0], addedLeaves);

    expect(addedLeaves).to.deep.equal(new Set([newLeaf]));

    addedLeaves = new Set();
    const removedLeaves = new Set();
    const node = newLeaf.add(entities[1], addedLeaves, removedLeaves) as Node<Entity>;

    const actualLeaves = Array.from(leftOuterJoin(addedLeaves, removedLeaves));
    expect(actualLeaves).to.have.members(node['children']);
  });

  it('add() should keep replaced leaves.', () => {
    let removedLeaves: Set<Leaf<Entity>> = new Set();
    const newLeaf1 = leaf.add(entities[0], undefined, removedLeaves);

    expect(removedLeaves).to.deep.equal(new Set([leaf]));

    const addedLeaves = new Set();
    removedLeaves = new Set();
    newLeaf1.add(entities[1], addedLeaves, removedLeaves);

    const actualLeaves = Array.from(leftOuterJoin(removedLeaves, addedLeaves));
    expect(actualLeaves).to.deep.equal([newLeaf1]);
  });

  it('add() should not keep created leaves if the entity is already added.', () => {
    let addedLeaves: Set<Leaf<Entity>> = new Set();
    leaf.add(entities[0]).add(entities[0], addedLeaves);

    expect(addedLeaves).to.be.empty;
  });

  it('remove() should return a new leaf excluding the removed value.', () => {
    const newLeaf = leaf.add(entities[0]).remove(entities[0]) as Leaf<Entity>;

    expect(newLeaf).not.to.equal(leaf);
    expect(newLeaf['values']).to.deep.equal(new Set());
    expect(newLeaf['maxDepth']).to.equal(1);
    expect(newLeaf['maxValuesCount']).to.equal(1);
    expect(newLeaf['depth']).to.equal(0);
    expect(newLeaf['bounds']).to.deep.equal(Rectangle.sized(100));
  });

  it('remove() should not modify the leaf itself.', () => {
    const newLeaf1 = leaf.add(entities[0]) as Leaf<Entity>;
    newLeaf1.remove(entities[0]);

    expect(newLeaf1['values']).to.deep.equal(new Set([entities[0]]));
    expect(newLeaf1['maxDepth']).to.equal(1);
    expect(newLeaf1['maxValuesCount']).to.equal(1);
    expect(newLeaf1['depth']).to.equal(0);
    expect(newLeaf1['bounds']).to.deep.equal(Rectangle.sized(100));
  });

  it('remove() should not replace leaves if the entity has not been added.', () => {
    const newLeaf = leaf.remove(entities[0]);
    expect(newLeaf).to.equal(leaf);
  });

  it('remove() should keep created leaves.', () => {
    let addedLeaves: Set<Leaf<Entity>> = new Set();
    const newLeaf1 = leaf.add(entities[0]).remove(entities[0], addedLeaves);

    expect(addedLeaves).to.deep.equal(new Set([newLeaf1]));
  });

  it('remove() should keep replaced leaves.', () => {
    let removedLeaves: Set<Leaf<Entity>> = new Set();
    const newLeaf1 = leaf.add(entities[0]);
    newLeaf1.remove(entities[0], undefined, removedLeaves);

    expect(removedLeaves).to.deep.equal(new Set([newLeaf1]));
  });

  it('remove() should not keep replaced leaves if the entity has not been added.', () => {
    let removedLeaves: Set<Leaf<Entity>> = new Set();
    leaf.remove(entities[0], undefined, removedLeaves);

    expect(removedLeaves).to.be.empty;
  });
});

describe('Quadtree.Node', () => {
  let mockEntities: Entity[];
  let entities: Entity[];
  let mockLeaves: Array<Leaf<Entity>>;
  let leaves: Array<Leaf<Entity>>;
  let node: Node<Entity>;

  beforeEach(() => {
    mockEntities = [mock(Entity), mock(Entity), mock(Entity)];
    entities = mockEntities.map(instance);
    mockLeaves = [mock(Leaf), mock(Leaf), mock(Leaf), mock(Leaf)];
    leaves = mockLeaves.map(instance);
    node = new Node(leaves, Rectangle.sized(100));

    when(mockEntities[0].coordinates).thenReturn(Point.origin());
    when(mockEntities[1].coordinates).thenReturn(Point.of(50, 0));
    when(mockEntities[2].coordinates).thenReturn(Point.of(50, 0));
    when(mockLeaves[0].listLeavesIn(deepEqual(Rectangle.sized(100)))).thenReturn([leaves[0]]);
    when(mockLeaves[1].listLeavesIn(deepEqual(Rectangle.sized(100)))).thenReturn([leaves[1]]);
    when(mockLeaves[2].listLeavesIn(anything())).thenReturn([]);
    when(mockLeaves[3].listLeavesIn(anything())).thenReturn([]);
  });

  it('listLeavesIn() should return all leaves in bounds.', () => {
    const listedLeaves1 = node.listLeavesIn(Rectangle.sized(100));
    expect(Array.from(listedLeaves1)).to.deep.equal([leaves[0], leaves[1]]);

    const listedLeaves2 = node.listLeavesIn(Rectangle.empty());
    expect(Array.from(listedLeaves2)).to.deep.equal([]);
  });

  it('add() should delegate to the corresponding leaf.', () => {
    node.add(entities[0]);

    verify(mockLeaves[0].add(entities[0], anything(), anything())).called();
    verify(mockLeaves[1].add(anything())).never();
    verify(mockLeaves[2].add(anything())).never();
    verify(mockLeaves[3].add(anything())).never();
  });

  it('remove() should delegate to the corresponding leaf.', () => {
    node.remove(entities[0]);

    verify(mockLeaves[0].remove(entities[0], anything(), anything())).called();
    verify(mockLeaves[1].remove(anything())).never();
    verify(mockLeaves[2].remove(anything())).never();
    verify(mockLeaves[3].remove(anything())).never();
  });
});
