import SystemFactory from './SystemFactory';
import {ChestEntity, Player} from '../alias';
import BuffDescription from './buff/BuffDescription';
import BuffDataApplier from './buff/BuffDataApplier';
import LawFactory from '../../law/LawFactory';
import Notifier from '../../output/notification/Notifier';
import ChestSystem, {ChestDemolisher, ChestOpener, ChestSpawner} from './ChestSystem';
import DynamicProvider from '../../util/DynamicProvider';
import EntityFactory from '../EntityFactory';
import EntityRegister from '../../util/entityStorage/EntityRegister';
import TutorialSystem from '../../engine/tick/TutorialSystem';
import SettingsManager from '../../environment/interface/SettingsManager';
import Input from '../../input/Input';

class SystemFactoryImpl implements SystemFactory {
  constructor(
      private game: Phaser.Game,
      private lawFactory: LawFactory,
      private player: Player,
      private buffDataApplier: BuffDataApplier,
      private buffDescription: BuffDescription,
      private notifier: Notifier,
      private entityFactory: EntityFactory,
      private settingsManager: SettingsManager,
      private input: Input) {
  }

  createChestSystem(
      renderRadius: DynamicProvider<number>, chestRegister: EntityRegister<ChestEntity>) {
    let chestLaw = this.lawFactory.createChestLaw(this.player, renderRadius);
    return new ChestSystem(
        new ChestOpener(
            this.game,
            this.player,
            this.buffDataApplier,
            chestLaw,
            this.notifier,
            this.buffDescription),
        new ChestSpawner(chestRegister, this.entityFactory, chestLaw, __DEV__),
        new ChestDemolisher(chestRegister));
  }

  createTutorialSystem() {
    const timer = this.game.time.create(false);
    timer.start();

    return new TutorialSystem(
        timer,
        this.settingsManager,
        this.notifier,
        this.input);
  }
}

export default SystemFactoryImpl;
