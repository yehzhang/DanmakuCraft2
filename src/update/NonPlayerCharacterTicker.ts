import TickListener from './entityTracker/TickListener';
import {AnimatedEntity, NonPlayerCharacter} from '../entity/entity';
import {Region} from '../entity/EntityManager';

export default class NonPlayerCharacterTicker
    implements TickListener<AnimatedEntity, NonPlayerCharacter> {
  onTick(trackee: AnimatedEntity, currentRegions: Array<Region<NonPlayerCharacter>>): void {
    for (let region of currentRegions) {
      region.forEach(npc => {
        npc.tick();
      });
    }
  }
}
