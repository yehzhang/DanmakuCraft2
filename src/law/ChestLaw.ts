import DataGenerator from '../util/dataGenerator/DataGenerator';
import {BuffData} from '../entitySystem/system/buff/BuffFactory';
import Point from '../util/syntax/Point';
import PhysicalConstants from '../PhysicalConstants';

class ChestLaw {
  constructor(
      readonly spawnLocationStrategy: DataGenerator<Point>,
      readonly spawnIntervalStrategy: DataGenerator<number>,
      readonly buffStrategy: DataGenerator<BuffData>,
      readonly maxChestsCount: number = PhysicalConstants.MAX_CHESTS_COUNT) {
  }
}

export default ChestLaw;
