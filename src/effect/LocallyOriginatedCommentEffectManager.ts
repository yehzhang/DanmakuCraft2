import {CommentEntity} from '../entity/comment';
import {Entity} from '../entity/entity';
import {Effect} from './effect';
import {EffectType} from './EffectFactory';

export class EffectData {
  constructor(public readonly type: number, public readonly parameter: number) {
  }

  toString() {
    return `Type: ${this.type}; Parameter: ${this.parameter}`;
  }
}

export default class LocallyOriginatedCommentEffectManager {
  private inactiveEffects: Array<Effect<CommentEntity>>;

  constructor(private maxActivatedEffectsCount: number) {
    this.inactiveEffects = [];
  }

  add(effect: Effect<CommentEntity>) {
    this.inactiveEffects.push(effect);
    if (this.inactiveEffects.length > this.maxActivatedEffectsCount) {
      this.inactiveEffects.shift();
    }
  }

  get(index: number): EffectData {
    if (index < 0 || index >= this.inactiveEffects.length) {
      throw new Error(`No effect at index ${index}`);
    }

    let effect = this.inactiveEffects[index];
    return this.toEffectData(effect);
  }

  hasEffect() {
    return this.inactiveEffects.length !== 0;
  }

  activateOne(): EffectData {
    let effect = this.inactiveEffects.shift();

    if (effect == null) {
      throw new Error('No effect to activate');
    }

    return this.toEffectData(effect);
  }

  peek() {
    if (!this.hasEffect()) {
      throw new Error('No effect to peek');
    }

    return this.toEffectData(this.inactiveEffects[0]);
  }

  private toEffectData(effect: Effect<Entity>) {
    let effectName = effect.constructor.name.toUpperCase();
    let effectType = (EffectType as any)[effectName];
    return new EffectData(effectType, effect.parameter);
  }
}
