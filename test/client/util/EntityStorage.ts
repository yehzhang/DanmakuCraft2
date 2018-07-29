import {expect} from 'chai';
import {instance, mock, when} from 'ts-mockito';
import {DisplayableEntity} from '../../../client/src/entitySystem/alias';
import Display from '../../../client/src/entitySystem/component/Display';
import MutableCoordinates from '../../../client/src/entitySystem/component/MutableCoordinates';
import Entity from '../../../client/src/entitySystem/Entity';
import {Phaser, PIXI} from '../../../client/src/util/alias/phaser';
import EntityFinder from '../../../client/src/util/entityStorage/EntityFinder';
import GlobalEntityStorage from '../../../client/src/util/entityStorage/GlobalEntityStorage';
import Point from '../../../client/src/util/syntax/Point';
import Rectangle from '../../../client/src/util/syntax/Rectangle';

describe('EntityFinder', () => {
  let mockEntities: DisplayableEntity[];
  let entities: DisplayableEntity[];

  beforeEach(() => {
    const FakeDisplayableEntity = () => {
    };
    FakeDisplayableEntity.prototype = Object.getPrototypeOf(Entity.newBuilder()
        .mix(new MutableCoordinates(Point.origin()))
        .mix(new Display(new PIXI.DisplayObjectContainer()))
        .build());

    mockEntities = [
      mock(FakeDisplayableEntity),
      mock(FakeDisplayableEntity),
    ];
    entities = mockEntities.map(instance);
  });

  function createTestCases(subject: string, createFinder: () => EntityFinder<Entity>) {
    let finder: EntityFinder<Entity>;

    beforeEach(() => {
      finder = createFinder();
    });

    describe(subject, () => {
      it('should list entities correctly', () => {
        when(mockEntities[0].coordinates).thenReturn(Point.origin());
        when(mockEntities[0].getDisplayWorldBounds()).thenReturn(Rectangle.empty());
        when(mockEntities[1].coordinates).thenReturn(Point.of(3, 4));
        when(mockEntities[1].getDisplayWorldBounds()).thenReturn(Rectangle.of(3, 4, 0, 0));

        expect(Array.from(finder.listAround(Point.origin(), 5))).to.deep.equal(entities);
        expect(Array.from(finder.listAround(Point.origin(), 5 - 1e-6)))
            .to.deep.equal([entities[0]]);
        expect(Array.from(finder.listAround(Point.of(4, 3), 5))).to.deep.equal(entities);
        expect(Array.from(finder.listAround(Point.of(4, 3), 5 - 1e-6)))
            .to.deep.equal([entities[1]]);

        expect(Array.from(finder.listAround(Point.origin(), 0))).to.be.empty;
      });
    });
  }

  createTestCases(
      'GlobalEntityStorage', () => new GlobalEntityStorage(new Set(entities), new Phaser.Signal()));
});
