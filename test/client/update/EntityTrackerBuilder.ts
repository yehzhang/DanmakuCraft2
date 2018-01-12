import EntityTrackerBuilder from '../../../client/src/update/EntityTrackerBuilder';
import {instance, mock, when} from 'ts-mockito';
import Entity from '../../../client/src/entitySystem/Entity';
import DynamicProvider from '../../../client/src/util/DynamicProvider';
import SuperposedEntityRenderSystem from '../../../client/src/entitySystem/system/existence/SuperposedEntityRenderSystem';
import TickSystem from '../../../client/src/entitySystem/system/tick/TickSystem';
import ExistenceSystem from '../../../client/src/entitySystem/system/existence/ExistenceSystem';
import EntityFinder from '../../../client/src/util/entityStorage/EntityFinder';
import ChunkEntityFinder from '../../../client/src/util/entityStorage/chunk/ChunkEntityFinder';
import {expect} from 'chai';
import {asSequence} from 'sequency';
import Point from '../../../client/src/util/syntax/Point';
import {Phaser} from '../../../client/src/util/alias/phaser';
import MoveDisplaySystem from '../../../client/src/entitySystem/system/tick/MoveDisplaySystem';

describe('EntityTrackerBuilder', () => {
  let builder: EntityTrackerBuilder;
  let mockTrackee: Entity;
  let mockEntityFinders: Array<EntityFinder<Entity>>;
  let entityFinders: Array<EntityFinder<Entity>>;
  let mockExistenceSystems: Array<ExistenceSystem<Entity>>;
  let existenceSystems: Array<ExistenceSystem<Entity>>;
  let mockTickSystems: TickSystem[];
  let tickSystems: TickSystem[];

  beforeEach(() => {
    mockTrackee = mock(Entity);
    mockTickSystems = [
      mock(MoveDisplaySystem),
      mock(MoveDisplaySystem),
      mock(MoveDisplaySystem),
      mock(MoveDisplaySystem)];
    tickSystems = mockTickSystems.map(instance);
    mockExistenceSystems = [
      mock(SuperposedEntityRenderSystem),
      mock(SuperposedEntityRenderSystem),
      mock(SuperposedEntityRenderSystem),
      mock(SuperposedEntityRenderSystem)];
    existenceSystems = mockExistenceSystems.map(instance);
    mockEntityFinders = [
      mock(ChunkEntityFinder),
      mock(ChunkEntityFinder)];
    entityFinders = mockEntityFinders.map(instance);

    when(mockEntityFinders[0].entityExistenceUpdated).thenReturn(new Phaser.Signal());
    when(mockEntityFinders[1].entityExistenceUpdated).thenReturn(new Phaser.Signal());
    when(mockTrackee.coordinates).thenReturn(Point.origin());

    builder = new EntityTrackerBuilder(instance(mockTrackee), new DynamicProvider(0))
        .applyTickSystem(tickSystems[0], false)
        .applyExistenceSystem(existenceSystems[0], entityFinders[1], false)
        .applyTickSystem(tickSystems[1], false)
        .applyExistenceSystem(existenceSystems[1], entityFinders[0], false)
        .applyTickSystem(tickSystems[2], true)
        .applyExistenceSystem(existenceSystems[2], entityFinders[1], true)
        .applyTickSystem(tickSystems[3], true)
        .applyExistenceSystem(existenceSystems[3], entityFinders[0], true);
  });

  it('should keeps system tickers in order', () => {
    let tracker = builder.build();

    let systems = asSequence([tracker['onUpdateSystemTickers'], tracker['onRenderSystemTickers']])
        .flatten()
        .map(ticker => (ticker as any)['system'])
        .toArray();
    expect(systems[0]).to.equal(tickSystems[2]);
    expect(systems[1]).to.equal(existenceSystems[2]);
    expect(systems[2]).to.equal(tickSystems[3]);
    expect(systems[3]).to.equal(existenceSystems[3]);
    expect(systems[4]).to.equal(tickSystems[0]);
    expect(systems[5]).to.equal(existenceSystems[0]);
    expect(systems[6]).to.equal(tickSystems[1]);
    expect(systems[7]).to.equal(existenceSystems[1]);
  });

  it('should create exactly one record for each entity finder', () => {
    let tracker = builder.build();

    let actualEntityFinders = asSequence(tracker['entityFinderRecords'])
        .map(record => record['entityFinder'])
        .toArray();
    expect(actualEntityFinders).to.have.members(entityFinders);
    expect(entityFinders).to.have.members(actualEntityFinders);
  });
});
