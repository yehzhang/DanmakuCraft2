import * as gaussian from 'gaussian';
import Entity from '../entitySystem/Entity';
import {BuffData, BuffType} from '../entitySystem/system/buff/BuffData';
import PhysicalConstants from '../PhysicalConstants';
import Chain from '../util/dataGenerator/Chain';
import Const from '../util/dataGenerator/Const';
import DataGenerator from '../util/dataGenerator/DataGenerator';
import Normal from '../util/dataGenerator/Normal';
import Scaler from '../util/dataGenerator/Scaler';
import SimpleDataGenerator from '../util/dataGenerator/SimpleDataGenerator';
import Threshold from '../util/dataGenerator/Threshold';
import Weighted from '../util/dataGenerator/Weighted';
import DynamicProvider from '../util/DynamicProvider';
import Point from '../util/syntax/Point';
import ChestLaw from './ChestLaw';
import ColorTransitionLaw from './ColorTransitionLaw';
import LawFactory from './LawFactory';

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
      spawnInterval: number = PhysicalConstants.CHEST_SPAWN_COOLDOWN) {
    const spawnLocationStrategy = Chain.total(this.baseGenerator)
        .pipe(Scaler.to(0, Phaser.Math.PI2))
        .pipe(Const.of(azimuth => {
          // Must be in render radius. Otherwise, chest may not be entered, and thus not exited and
          // demolished. Minus one for miserable floating point number arithmetic.
          const radius = renderRadius.getValue() - 1;
          const offset = Point.ofPolar(azimuth, radius);
          return Phaser.Point.add(trackee.coordinates, offset);
        }))
        .build();

    const spawnIntervalStrategy = Chain.total(this.baseGenerator)
        .pipe(Normal.capped(gaussian(0, spawnInterval / 4)))
        .pipe(Scaler.to(0, spawnInterval * 2))
        .build();

    const buffStrategy = Chain.total(this.baseGenerator)
        .pipe(Weighted.newBuilder<BuffData>()
            .add(new BuffData(BuffType.NONE), 1)
            .add(new BuffData(BuffType.CHROMATIC), 2)
            .add(new BuffData(BuffType.HASTY), 7)
            .build())
        .build();

    return new ChestLaw(spawnLocationStrategy, spawnIntervalStrategy, buffStrategy);
  }

  private createColorTransitionLawInstance() {
    const speedStrategy = Chain.total(this.baseGenerator)
        .pipe(Normal.capped(gaussian(0, 5)))
        .pipe(Scaler.to(0, 5))
        .build();
    const pauseStrategy = Chain.total(this.baseGenerator)
        .pipe(Threshold.smallerThan(0.003))
        .build();
    const pauseIntervalStrategy = Chain.total(this.baseGenerator)
        .pipe(Normal.capped(gaussian(0, 5)))
        .pipe(Scaler.to(4, 7))
        .pipe(Const.of(interval => interval * Phaser.Timer.SECOND))
        .build();
    return new ColorTransitionLaw(speedStrategy, pauseStrategy, pauseIntervalStrategy);
  }
}

export default LawFactoryImpl;
