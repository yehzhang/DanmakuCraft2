import Point from '../util/syntax/Point';
import EntityRegister from '../util/entityStorage/EntityRegister';
import Entity from '../entitySystem/Entity';
import {CommentEntity, SignEntity} from '../entitySystem/alias';

interface Preset {
  getPlayerSpawnPoint(): Point;

  populateSpawnPoints(
      pointsRegister: EntityRegister<Entity>,
      commentsRegister: EntityRegister<CommentEntity>,
      spawnPointSignSize?: number): void;

  populateSigns(signsRegister: EntityRegister<SignEntity>): void;
}

export default Preset;
