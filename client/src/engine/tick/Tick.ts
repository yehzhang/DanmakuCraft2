import TickEngine from './TickEngine';
import MoveDisplaySystem from '../../entitySystem/system/tick/MoveDisplaySystem';
import {Player} from '../../entitySystem/alias';
import ChestSystem from '../../entitySystem/system/ChestSystem';
import SystemFactory from '../../entitySystem/system/SystemFactory';
import TutorialSystem from './TutorialSystem';

class Tick {
  constructor(
      readonly beforeVisibility: TickEngine,
      readonly afterVisibility: TickEngine,
      readonly tutorialSystem: TutorialSystem) {
  }

  static on(player: Player, chestSystem: ChestSystem, systemFactory: SystemFactory) {
    const tutorialSystem = systemFactory.createTutorialSystem();

    const beforeVisibilityBuilder = TickEngine.newBuilder();

    beforeVisibilityBuilder.onUpdate()
        .apply(chestSystem).atEnter()
        .apply(tutorialSystem).atEnter();

    beforeVisibilityBuilder.onRender().apply(new MoveDisplaySystem(player)).atEnter();

    const afterVisibilityBuilder = TickEngine.newBuilder();

    return new this(
        beforeVisibilityBuilder.build(),
        afterVisibilityBuilder.build(),
        tutorialSystem);
  }
}

export default Tick;
