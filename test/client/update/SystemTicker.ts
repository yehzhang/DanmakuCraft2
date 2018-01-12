import {
  EntityFinderRecord, RecordSystemTicker, SystemTicker,
  TickSystemTicker
} from '../../../client/src/update/EntityTracker';
import VisibilitySystem from '../../../client/src/entitySystem/system/visibility/VisibilitySystem';
import Entity from '../../../client/src/entitySystem/Entity';
import {instance, mock, resetCalls, verify, when} from 'ts-mockito';
import {Phaser} from '../../../client/src/util/alias/phaser';
import TickSystem from '../../../client/src/entitySystem/system/tick/TickSystem';
import MoveDisplaySystem from '../../../client/src/entitySystem/system/tick/MoveDisplaySystem';
import BackgroundColorSystem from '../../../client/src/entitySystem/system/visibility/BackgroundColorSystem';

describe('RecordSystemTicker', () => {
  let mockSystem: VisibilitySystem<Entity>;
  let mockRecord: EntityFinderRecord<Entity>;
  let entities: Entity[];
  let time: Phaser.Time;
  let ticker: SystemTicker;

  beforeEach(() => {
    mockSystem = mock(BackgroundColorSystem);
    mockRecord = mock(EntityFinderRecord);
    time = instance(mock(Phaser.Time));
    entities = [instance(mock(Entity))];

    ticker = new RecordSystemTicker(instance(mockSystem), instance(mockRecord));
  });

  it('should call lifecycle methods', () => {
    when(mockRecord.enteringEntities).thenReturn(entities);
    when(mockRecord.exitingEntities).thenReturn(entities);
    when(mockRecord.currentEntities).thenReturn(new Set(entities));

    ticker.backwardTick(time);

    verify(mockSystem.exit(entities[0])).once();

    resetCalls(mockSystem);
    ticker.firstForwardTick(time);

    verify(mockSystem.enter(entities[0])).once();
    verify(mockSystem.update(entities[0], time)).once();

    resetCalls(mockSystem);
    ticker.secondForwardTick(time);

    verify(mockSystem.finish()).once();

  });

  it('should not call finish if no visibility was updated', () => {
    when(mockRecord.enteringEntities).thenReturn([]);
    when(mockRecord.exitingEntities).thenReturn([]);
    when(mockRecord.currentEntities).thenReturn(new Set());

    ticker.backwardTick(time);
    ticker.firstForwardTick(time);
    ticker.secondForwardTick(time);

    verify(mockSystem.finish()).never();
  });
});

describe('TickSystemTicker', () => {
  let mockSystem: TickSystem;
  let entities: Entity[];
  let time: Phaser.Time;
  let ticker: SystemTicker;

  beforeEach(() => {
    mockSystem = mock(MoveDisplaySystem);
    time = instance(mock(Phaser.Time));
    entities = [instance(mock(Entity))];

    ticker = new TickSystemTicker(instance(mockSystem));
  });

  it('should call lifecycle methods', () => {
    ticker.firstForwardTick(time);
    verify(mockSystem.tick(time)).once();
  });
});
