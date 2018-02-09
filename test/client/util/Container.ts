import {instance, mock} from 'ts-mockito';
import ImmutableContainer from '../../../client/src/util/entityStorage/ImmutableContainer';
import Entity from '../../../client/src/entitySystem/Entity';
import SetContainer from '../../../client/src/util/entityStorage/chunk/SetContainer';
import {expect} from 'chai';

describe('SetContainer', () => {
  let mockEntities: Entity[];
  let entities: Entity[];
  let container: ImmutableContainer<Entity>;

  beforeEach(() => {
    mockEntities = [
      mock(Entity),
      mock(Entity),
      mock(Entity)];
    entities = mockEntities.map(instance);
    container = new SetContainer();
  });

  it('add() and count() work', () => {
    expect(container.count()).to.equal(0);

    container = container.add(entities[0]);
    expect(container.count()).to.equal(1);

    container = container.add(entities[1]);
    expect(container.count()).to.equal(2);

    container = container.add(entities[2]);
    expect(container.count()).to.equal(3);
  });

  it('container is immutable', () => {
    container.add(entities[0]);
    expect(container.count()).to.equal(0);
  });

  it('add() discards duplicate entities', () => {
    container = container.add(entities[0]);
    container = container.add(entities[0]);

    expect(container.count()).to.equal(1);
  });

  it('iteration works', () => {
    container = container.add(entities[0]);
    container = container.add(entities[1]);
    container = container.add(entities[2]);

    let entitiesIndex = 0;
    for (let entity of container) {
      expect(entity).to.equal(entities[entitiesIndex]);
      entitiesIndex++;
    }
    expect(entitiesIndex).to.equal(entities.length);
  });
});
