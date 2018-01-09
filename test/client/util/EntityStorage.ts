import EntityFinder from '../../../client/src/util/entityStorage/EntityFinder';
import Entity from '../../../client/src/entitySystem/Entity';
import {instance, mock, when} from 'ts-mockito';
import GlobalEntityFinder from '../../../client/src/util/entityStorage/global/GlobalEntityFinder';
import Point from '../../../client/src/util/syntax/Point';
import {expect} from 'chai';
import {Phaser} from '../../../client/src/util/alias/phaser';

describe('EntityFinder', () => {
  let mockEntities: Entity[];
  let entities: Entity[];

  beforeEach(() => {
    mockEntities = [
      mock(Entity),
      mock(Entity),
    ];
    entities = mockEntities.map(instance);
  });

  createTestCases(
      'GlobalEntityFinder', () => new GlobalEntityFinder(new Set(entities), new Phaser.Signal()));

  function createTestCases(subject: string, createFinder: () => EntityFinder<Entity>) {
    let finder: EntityFinder<Entity>;

    beforeEach(() => {
      finder = createFinder();
    });

    describe('should list entities correctly', () => {
      it(`for ${subject}`, () => {
        when(mockEntities[0].coordinates).thenReturn(Point.origin());
        when(mockEntities[1].coordinates).thenReturn(Point.of(3, 4));

        expect(Array.from(finder.listAround(Point.origin(), 5))).to.deep.equal(entities);
        expect(Array.from(finder.listAround(Point.origin(), 5 - 1e-6)))
            .to.deep.equal([entities[0]]);
        expect(Array.from(finder.listAround(Point.of(4, 3), 5))).to.deep.equal(entities);
        expect(Array.from(finder.listAround(Point.of(4, 3), 5 - 1e-6)))
            .to.deep.equal([entities[1]]);

        expect(Array.from(finder.listAround(Point.origin(), 0))).to.deep.equal([]);
      });
    });
  }
});
