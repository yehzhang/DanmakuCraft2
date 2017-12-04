import {Chromatic, Effect, Ethereal} from './effect';
import {Entity} from '../entity/entity';
import {EffectData} from './LocallyOriginatedCommentEffectManager';

export enum EffectType {
  ETHEREAL = 0,  // nothing
  CHROMATIC = 1,  // colorful comment
  SHAPELY = 2,  // simple geometry
  GRAPHICAL = 3,  // bitmap image
  KINETIC = 4,  // moving comment
  BLAZING = 5,  // tiny firework
  ELEGANT = 6,  // different font
  // Reserved HASTY = 7,
}

export default class EffectFactory {
  create(effectData: EffectData): Effect<Entity> {
    switch (effectData.type) {
      case EffectType.ETHEREAL:
        return this.createEthereal();
      case EffectType.CHROMATIC:
        return this.createChromatic();
      default:
        throw new TypeError(`Invalid effect type: ${effectData}`);
    }
  }

  createEthereal() {
    return Ethereal.getInstance();
  }

  createChromatic() {
    return new Chromatic();
  }
}
