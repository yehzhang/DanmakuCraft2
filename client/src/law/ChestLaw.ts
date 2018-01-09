import DataGenerator from '../util/dataGenerator/DataGenerator';
import {BuffData} from '../entitySystem/system/buff/BuffData';
import Point from '../util/syntax/Point';

class ChestLaw {
  constructor(
      readonly spawnLocationStrategy: DataGenerator<Point>,
      readonly spawnIntervalStrategy: DataGenerator<number>,
      readonly buffStrategy: DataGenerator<BuffData>) {
  }
}

export default ChestLaw;
