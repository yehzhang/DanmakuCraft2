import ColorTransitionLaw from './ColorTransitionLaw';
import DataGenerator from '../util/dataGenerator/DataGenerator';
import LawFactory from './LawFactory';
import Const from '../util/dataGenerator/Const';
import Weighted from '../util/dataGenerator/Weighted';
import Chain from '../util/dataGenerator/Chain';
import * as gaussian from 'gaussian';
import {BuffData, BuffType} from '../entitySystem/system/buff/BuffFactory';
import ChestLaw from './ChestLaw';
import Point from '../util/syntax/Point';
import SimpleDataGenerator from '../util/dataGenerator/SimpleDataGenerator';
import Scaler from '../util/dataGenerator/Scaler';
import Normal from '../util/dataGenerator/Normal';
import PhysicalConstants from '../PhysicalConstants';
import Entity from '../entitySystem/Entity';
import DynamicProvider from '../util/DynamicProvider';
import Threshold from '../util/dataGenerator/Threshold';

class LawFactoryImpl implements LawFactory {
  constructor(
      private baseGenerator: DataGenerator = new SimpleDataGenerator(),
      private colorTransitionLawInstance: ColorTransitionLaw | null = null) {
  }

  createColorTransitionLaw() {
    if (this.colorTransitionLawInstance == null) {
      this.colorTransitionLawInstance = this.createColorTransitionLawInstance();
    }
    return this.colorTransitionLawInstance;
  }

  createChestLaw(
      trackee: Entity,
      renderRadius: DynamicProvider<number>,
      spawnInterval: number = PhysicalConstants.CHEST_SPAWN_INTERVAL) {
    let spawnLocationStrategy = Chain.total(this.baseGenerator)
        .pipe(Scaler.to(0, Phaser.Math.PI2))
        .pipe(Const.of(azimuth => {
          let radius = renderRadius.getValue() + 100;
          let offset = Point.origin().setToPolar(azimuth, radius);
          return Phaser.Point.add(trackee.coordinates, offset);
        }))
        .build();

    let spawnIntervalStrategy = Chain.total(this.baseGenerator)
        .pipe(Normal.capped(gaussian(0, spawnInterval / 2)))
        .pipe(Scaler.to(0, spawnInterval * 2))
        .build();

    let buffStrategy = Chain.total(this.baseGenerator)
        .pipe(Weighted.newBuilder<BuffData>()
            .add(new BuffData(BuffType.ETHEREAL), 1)
            .add(new BuffData(BuffType.CHROMATIC), 5)
            .add(new BuffData(BuffType.HASTY), 2)
            .build())
        .build();

    return new ChestLaw(spawnLocationStrategy, spawnIntervalStrategy, buffStrategy);
  }

  private createColorTransitionLawInstance() {
    let speedStrategy = Chain.total(this.baseGenerator)
        .pipe(Normal.capped(gaussian(0, 5)))
        .pipe(Scaler.to(0, 3))
        .build();
    let pauseStrategy = Chain.total(this.baseGenerator)
        .pipe(Threshold.smallerThan(0.003))
        .build();
    let pauseIntervalStrategy = Chain.total(this.baseGenerator)
        .pipe(Normal.capped(gaussian(0, 5)))
        .pipe(Scaler.to(4, 7))
        .build();
    return new ColorTransitionLaw(speedStrategy, pauseStrategy, pauseIntervalStrategy);
  }
}

export default LawFactoryImpl;
