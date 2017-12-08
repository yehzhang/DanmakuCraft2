import {SuperposedEntity} from '../../../src/entity/entity';
import {Region} from '../../../src/entity/EntityManager';
import {Chunk} from '../../../src/entity/chunk';
import {Point} from '../util';
import {anything, deepEqual, instance, mock, verify, when} from 'ts-mockito';
import {expect} from 'chai';
import PhysicalConstants from '../../../src/PhysicalConstants';
import {generateSuperposedEntityTests} from '../generator';

describe('Region', () => {
  const regionFactory = (coordinate: Phaser.Point) => new Chunk(coordinate);
  generateSuperposedEntityTests(regionFactory);

  let mockEntities: SuperposedEntity[];
  let entities: SuperposedEntity[];
  let region: Region;

  function createMockEntity() {
    let mockEntity = mock(Chunk);
    when(mockEntity.measure()).thenReturn(new PIXI.DisplayObjectContainer());
    return mockEntity;
  }

  beforeEach(() => {
    mockEntities = [
      createMockEntity(),
      createMockEntity(),
      createMockEntity()];
    entities = mockEntities.map(instance);
    region = regionFactory(Point.origin());
  });


  it('decohere() decoheres all children', () => {
    region.loadEntity(entities[0]);
    region.loadEntity(entities[1]);
    region.loadEntity(entities[2]);
    region.decohere(Point.origin());

    verify(mockEntities[0].decohere(anything())).called();
    verify(mockEntities[1].decohere(anything())).called();
    verify(mockEntities[2].decohere(anything())).called();
  });

  it(`decohere() decoheres a child with region's coordinate`, () => {
    region.loadEntity(entities[0]);
    region.decohere(Point.origin());

    verify(mockEntities[0].decohere(deepEqual(new PIXI.Point()))).once();

    region.cohere();
    region.decohere(Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE - 1));

    verify(mockEntities[0].decohere(deepEqual(new PIXI.Point()))).twice();
  });

  it(`decohere() adds a child to region's display`, () => {
    region.loadEntity(entities[0]);
    region.decohere(Point.origin());

    verify(mockEntities[0].decohere(anything())).once();
    verify(mockEntities[0].measure()).once();

    expect(region.measure().children).to.have.members([entities[0].measure()]);
  });

  it('cohere() coheres all children', () => {
    region.loadEntity(entities[0]);
    region.loadEntity(entities[1]);
    region.loadEntity(entities[2]);
    region.decohere(Point.origin());
    region.cohere();

    verify(mockEntities[0].cohere()).called();
    verify(mockEntities[1].cohere()).called();
    verify(mockEntities[2].cohere()).called();
  });

  it('cohere() coheres a child correctly', () => {
    region.loadEntity(entities[0]);
    region.decohere(Point.origin());
    region.cohere();

    verify(mockEntities[0].cohere()).once();
  });

  it('loadEntity() decoheres new entities', () => {
    region.loadEntity(entities[0]);
    region.decohere(Point.origin());
    region.loadEntity(entities[1]);

    verify(mockEntities[1].decohere(anything())).once();
    verify(mockEntities[1].measure()).once();

    expect(region.measure().children).to.have
        .members([entities[0].measure(), entities[1].measure()]);
  });
});
