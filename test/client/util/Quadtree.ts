import {expect} from 'chai';
import {anything, instance, mock, verify, when} from 'ts-mockito';
import {StationaryEntity} from '../../../client/src/entitySystem/alias';
import Entity from '../../../client/src/entitySystem/Entity';
import ArrayCollector from '../../../client/src/util/dataStructures/ArrayCollector';
import Quadtree, {Leaf, Node} from '../../../client/src/util/dataStructures/Quadtree';
import {Collector} from '../../../client/src/util/entityStorage/EntityFinder';
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
    let collector = new ArrayCollector();
    leaf.add(entities[0]).collectIn(Rectangle.sized(1), collector);
    expect(collector.values).to.deep.equal([entities[0]]);

    collector = new ArrayCollector();
    leaf.collectIn(Rectangle.empty(), collector);
    expect(collector.values).to.be.empty;
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

    expect(node).to.be.instanceOf(Node);
    expect(node['bounds']).to.deep.equal(Rectangle.sized(100));

    expect((node['topLeftChild'] as Leaf<any>)['bounds'])
        .to.shallowDeepEqual(Rectangle.sized(50));
    expect((node['topRightChild'] as Leaf<any>)['bounds'])
        .to.shallowDeepEqual(Rectangle.of(50, 0, 50, 50));
    expect((node['bottomLeftChild'] as Leaf<any>)['bounds'])
        .to.shallowDeepEqual(Rectangle.of(0, 50, 50, 50));
    expect((node['bottomRightChild'] as Leaf<any>)['bounds'])
        .to.shallowDeepEqual(Rectangle.of(50, 50, 50, 50));
    expect((node['topLeftChild'] as Leaf<any>)['depth']).to.equal(1);
    expect((node['topLeftChild'] as Leaf<any>)['maxDepth']).to.equal(1);
    expect((node['topLeftChild'] as Leaf<any>)['maxValuesCount']).to.equal(1);
    expect((node['topLeftChild'] as Leaf<any>)['values']).to.deep.equal([entities[0]]);
    expect((node['topRightChild'] as Leaf<any>)['values']).to.deep.equal([entities[1]]);
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
  let collector: Collector<Entity>;

  beforeEach(() => {
    mockEntity = mock(Entity) as any;
    entity = instance(mockEntity);
    collector = new ArrayCollector();
    mockLeaves = [mock(Leaf), mock(Leaf), mock(Leaf), mock(Leaf)];
    const leaves = mockLeaves.map(instance);
    node = new Node(leaves[0], leaves[1], leaves[2], leaves[3], Rectangle.sized(100));

    when(mockEntity.coordinates).thenReturn(Point.origin());
  });

  it('should delegate `collectIn` to children', () => {
    const bounds = new Rectangle(1, 1, 99, 99);
    node.collectIn(bounds, collector);

    verify(mockLeaves[0].collectIn(bounds, collector)).once();
    verify(mockLeaves[1].collectIn(bounds, collector)).once();
    verify(mockLeaves[2].collectIn(bounds, collector)).once();
    verify(mockLeaves[3].collectIn(bounds, collector)).once();
  });

  it('should delegate `collectAll` to children', () => {
    node.collectAll(collector);

    verify(mockLeaves[0].collectAll(collector)).once();
    verify(mockLeaves[1].collectAll(collector)).once();
    verify(mockLeaves[2].collectAll(collector)).once();
    verify(mockLeaves[3].collectAll(collector)).once();
  });

  it('should not delegate `collectIn` to children if not necessary', () => {
    node.collectIn(Rectangle.sized(101), collector);

    verify(mockLeaves[0].collectIn(anything(), anything())).never();
    verify(mockLeaves[1].collectIn(anything(), anything())).never();
    verify(mockLeaves[2].collectIn(anything(), anything())).never();
    verify(mockLeaves[3].collectIn(anything(), anything())).never();
  });

  it('should not delegate `collectIn` to children if the bounds do not intersect', () => {
    node.collectIn(Rectangle.empty(), collector);

    verify(mockLeaves[0].collectIn(anything(), anything())).never();
    verify(mockLeaves[1].collectIn(anything(), anything())).never();
    verify(mockLeaves[2].collectIn(anything(), anything())).never();
    verify(mockLeaves[3].collectIn(anything(), anything())).never();
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
