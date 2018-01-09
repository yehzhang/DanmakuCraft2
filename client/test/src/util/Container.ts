import {instance, mock} from 'ts-mockito';
import Container from '../../../src/util/entityStorage/Container';
import Entity from '../../../src/entitySystem/Entity';
import ArrayContainer from '../../../src/util/entityStorage/chunk/ArrayContainer';
import {expect} from 'chai';

describe('ArrayContainer', () => {
  let mockEntities: Entity[];
  let entities: Entity[];
  let container: Container<Entity>;

  beforeEach(() => {
    mockEntities = [
      mock(Entity),
      mock(Entity),
      mock(Entity)];
    entities = mockEntities.map(instance);
    container = new ArrayContainer([]);
  });

  it('add() and count() work', () => {
    expect(container.count()).to.equal(0);

    container.add(entities[0]);
    expect(container.count()).to.equal(1);

    container.add(entities[1]);
    expect(container.count()).to.equal(2);

    container.add(entities[2]);
    expect(container.count()).to.equal(3);
  });

  it('add() discards duplicate entities', () => {
    container.add(entities[0]);
    container.add(entities[0]);

    expect(container.count()).to.equal(1);
  });

  it('iteration works', () => {
    container.add(entities[0]);
    container.add(entities[1]);
    container.add(entities[2]);

    let entitiesIndex = 0;
    for (let entity of container) {
      expect(entity).to.equal(entities[entitiesIndex]);
      entitiesIndex++;
    }
    expect(entitiesIndex).to.equal(entities.length);
  });
});
