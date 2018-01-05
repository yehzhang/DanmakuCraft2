import ChestLaw from './ChestLaw';
import ColorTransitionLaw from './ColorTransitionLaw';
import Entity from '../entitySystem/Entity';
import DynamicProvider from '../util/DynamicProvider';

interface LawFactory {
  createColorTransitionLaw(): ColorTransitionLaw;

  createChestLaw(
      trackee: Entity,
      renderRadius: DynamicProvider<number>,
      spawnInterval?: number): ChestLaw;
}

export default LawFactory;
