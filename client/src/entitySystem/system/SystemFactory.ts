import ChestSystem from './ChestSystem';
import DynamicProvider from '../../util/DynamicProvider';
import {ChestEntity} from '../alias';
import EntityRegister from '../../util/entityStorage/EntityRegister';

interface SystemFactory {
  createChestSystem(
      renderRadius: DynamicProvider<number>,
      chestRegister: EntityRegister<ChestEntity>): ChestSystem;
}

export default SystemFactory;
