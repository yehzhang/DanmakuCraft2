import EntityWiseTickSystem from './EntityWiseTickSystem';
import {MovableEntity, Region, Updatable} from '../../alias';
import EntityFinder from '../../../util/entityFinder/EntityFinder';
import Entity from '../../Entity';

class UpdateSystem extends EntityWiseTickSystem<MovableEntity, Updatable<any>> {
  constructor(private time: Phaser.Time) {
    super();
  }

  protected onTickEntity(
      entityFinder: EntityFinder<Updatable<Entity>>,
      trackee: MovableEntity,
      currentRegion: Region<Updatable<Entity>>,
      entity: Updatable) {
    entity.tick(entity, this.time);
  }
}

export default UpdateSystem;
