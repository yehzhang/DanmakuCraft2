import TutorialSystem from '../../engine/tick/TutorialSystem';
import SettingsManager from '../../environment/interface/SettingsManager';
import Input from '../../input/Input';
import LawFactory from '../../law/LawFactory';
import Notifier from '../../output/notification/Notifier';
import DynamicProvider from '../../util/DynamicProvider';
import EntityRegister from '../../util/entityStorage/EntityRegister';
import {ChestEntity, Player} from '../alias';
import EntityFactory from '../EntityFactory';
import BuffDataApplier from './buff/BuffDataApplier';
import BuffDescription from './buff/BuffDescription';
import ChestSystem, {ChestDemolisher, ChestOpener, ChestSpawner} from './ChestSystem';
import SystemFactory from './SystemFactory';

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
      private timer: Phaser.Timer,
      private input: Input) {
  }

  createChestSystem(
      renderRadius: DynamicProvider<number>, chestRegister: EntityRegister<ChestEntity>) {
    const chestLaw = this.lawFactory.createChestLaw(this.player, renderRadius);
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
    return new TutorialSystem(
        this.timer,
        this.settingsManager,
        this.notifier,
        this.input);
  }
}

export default SystemFactoryImpl;
