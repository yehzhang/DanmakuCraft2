import TickEngine from './TickEngine';
import MoveDisplaySystem from '../../entitySystem/system/tick/MoveDisplaySystem';
import {Player} from '../../entitySystem/alias';
import ChestSystem from '../../entitySystem/system/ChestSystem';

class Tick {
  constructor(
      readonly beforeVisibility: TickEngine, readonly afterVisibility: TickEngine) {
  }

  static on(player: Player, chestSystem: ChestSystem) {
    const beforeVisibilityBuilder = TickEngine.newBuilder();

    beforeVisibilityBuilder.onRender().apply(new MoveDisplaySystem(player)).atEnter();

    beforeVisibilityBuilder.onUpdate().apply(chestSystem).atEnter();

    const afterVisibilityBuilder = TickEngine.newBuilder();

    return new this(beforeVisibilityBuilder.build(), afterVisibilityBuilder.build());
  }
}

export default Tick;
