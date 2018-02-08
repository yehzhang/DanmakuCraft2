import SystemEnginesEngine from '../SystemEnginesEngine';
import TickEngine from './TickEngine';
import MoveDisplaySystem from '../../entitySystem/system/tick/MoveDisplaySystem';
import {Player} from '../../entitySystem/alias';
import ChestSystem from '../../entitySystem/system/ChestSystem';

class Tick extends SystemEnginesEngine<TickEngine> {
  static on(player: Player, chestSystem: ChestSystem) {
    let tickEngineBuilder = TickEngine.newBuilder();
    tickEngineBuilder.onUpdate().apply(chestSystem).atEnd();
    tickEngineBuilder.onRender().apply(new MoveDisplaySystem(player)).atBegin();

    return new this([tickEngineBuilder.build()]);
  }
}

export default Tick;
