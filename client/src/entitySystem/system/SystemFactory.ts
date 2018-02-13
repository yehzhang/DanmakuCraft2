import ChestSystem from './ChestSystem';
import DynamicProvider from '../../util/DynamicProvider';
import {ChestEntity} from '../alias';
import EntityRegister from '../../util/entityStorage/EntityRegister';
import TutorialSystem from '../../engine/tick/TutorialSystem';

interface SystemFactory {
  createChestSystem(
      renderRadius: DynamicProvider<number>,
      chestRegister: EntityRegister<ChestEntity>): ChestSystem;

  createTutorialSystem(): TutorialSystem;
}

export default SystemFactory;
