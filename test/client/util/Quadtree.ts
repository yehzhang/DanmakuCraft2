import {expect} from 'chai';
import {anything, instance, mock, verify, when} from 'ts-mockito';
import {StationaryEntity} from '../../../client/src/entitySystem/alias';
import Entity from '../../../client/src/entitySystem/Entity';
import Quadtree, {Leaf, Node} from '../../../client/src/util/dataStructures/Quadtree';
import Point from '../../../client/src/util/syntax/Point';
import Rectangle from '../../../client/src/util/syntax/Rectangle';
import chai = require('chai');
import chaiShallowDeepEqual = require('chai-shallow-deep-equal');

chai.use(chaiShallowDeepEqual);

describe('Quadtree.Leaf', () => {
  let mockEntities: StationaryEntity[];
  let entities: StationaryEntity[];
  let leaf: Leaf<StationaryEntity>;

  beforeEach(() => {
    mockEntities = [mock(Entity), mock(Entity), mock(Entity)] as any;
    entities = mockEntities.map(instance);

    when(mockEntities[0].coordinates).thenReturn(Point.origin());
    when(mockEntities[1].coordinates).thenReturn(Point.of(50, 0));
    when(mockEntities[2].coordinates).thenReturn(Point.of(50, 0));

    leaf = new Leaf(Rectangle.sized(100), 1, 1);
  });

  it('should list values in bounds', () => {
    const leaves1 = leaf.add(entities[0]).listIn(Rectangle.sized(1));
    expect(leaves1).to.shallowDeepEqual([entities[0]]);

    const leaves2 = leaf.listIn(Rectangle.empty());
    expect(leaves2).to.be.empty;
  });

  it('should return itself', () => {
    expect(leaf.add(entities[0])).to.equal(leaf);
  });

  it('should add a value', () => {
    leaf.add(entities[0]);
    expect(Array.from(leaf)).to.deep.equal([entities[0]]);
  });

  it('should lift a leaf as node if there are more entities than a leaf could contain', () => {
    const node = leaf.add(entities[0]).add(entities[1]) as Node<StationaryEntity>;

    expect(node['bounds']).to.deep.equal(Rectangle.sized(100));
    expect(node['children'].length).to.equal(4);

    const leaves = node['children'] as Array<Leaf<StationaryEntity>>;
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

  it('should not add a value if it is already added', () => {
    const node1 = leaf.add(entities[0]);
    const node2 = node1.add(entities[0]);

    expect(node1).to.equal(node2);
  });

  it('should keep added value', () => {
    let addedValues: StationaryEntity[] = [];
    leaf.add(entities[0], addedValues);

    expect(addedValues).to.deep.equal([entities[0]]);
  });

  it('should not keep a value if it is already added', () => {
    const addedValues: StationaryEntity[] = [];
    leaf.add(entities[0]).add(entities[0], addedValues);

    expect(addedValues).to.be.empty;
  });

  it('should remove a value', () => {
    const newLeaf = leaf.add(entities[0]);
    newLeaf.remove(entities[0]);

    expect(Array.from(newLeaf)).to.be.empty;
  });

  it('should not replace leaves if no values are removed', () => {
    expect(leaf.remove(entities[0])).to.equal(leaf);
  });

  it('should keep removed value', () => {
    const removedValues: StationaryEntity[] = [];
    leaf.add(entities[0]).remove(entities[0], removedValues);

    expect(removedValues).to.deep.equal([entities[0]]);
  });
});

describe('Quadtree.Node', () => {
  let mockEntity: StationaryEntity;
  let entity: StationaryEntity;
  let mockLeaves: Array<Leaf<StationaryEntity>>;
  let node: Node<StationaryEntity>;

  beforeEach(() => {
    mockEntity = mock(Entity) as any;
    entity = instance(mockEntity);
    mockLeaves = [mock(Leaf), mock(Leaf), mock(Leaf), mock(Leaf)];
    node = new Node(mockLeaves.map(instance), Rectangle.sized(100));

    when(mockEntity.coordinates).thenReturn(Point.origin());
    when(mockLeaves[0].listIn(anything())).thenReturn([]);
    when(mockLeaves[1].listIn(anything())).thenReturn([]);
    when(mockLeaves[2].listIn(anything())).thenReturn([]);
    when(mockLeaves[3].listIn(anything())).thenReturn([]);
  });

  it('should delegate `list` to all children', () => {
    node.listIn(Rectangle.sized(100));

    verify(mockLeaves[0].listIn(anything())).once();
    verify(mockLeaves[1].listIn(anything())).once();
    verify(mockLeaves[2].listIn(anything())).once();
    verify(mockLeaves[3].listIn(anything())).once();
  });

  it('should not delegate `list` to any children if the bounds do not intersect', () => {
    node.listIn(Rectangle.empty());

    verify(mockLeaves[0].listIn(anything())).never();
    verify(mockLeaves[1].listIn(anything())).never();
    verify(mockLeaves[2].listIn(anything())).never();
    verify(mockLeaves[3].listIn(anything())).never();
  });

  it('should delegate `add` to corresponding leaf', () => {
    node.add(entity);

    verify(mockLeaves[0].add(entity, anything())).called();
    verify(mockLeaves[1].add(anything(), anything())).never();
    verify(mockLeaves[2].add(anything(), anything())).never();
    verify(mockLeaves[3].add(anything(), anything())).never();
  });

  it('should delegate `remove` to corresponding leaf', () => {
    node.remove(entity);

    verify(mockLeaves[0].remove(entity, anything())).called();
    verify(mockLeaves[1].remove(anything(), anything())).never();
    verify(mockLeaves[2].remove(anything(), anything())).never();
    verify(mockLeaves[3].remove(anything(), anything())).never();
  });
});
