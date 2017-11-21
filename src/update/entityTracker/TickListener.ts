import {AnimatedEntity, SuperposedEntity} from '../../entity/entity';
import {Region} from '../../entity/EntityManager';

export default interface TickListener<
    T extends AnimatedEntity = AnimatedEntity, E extends SuperposedEntity = SuperposedEntity> {
  onTick(trackee: T, currentRegions: Array<Region<E>>): void;
}
