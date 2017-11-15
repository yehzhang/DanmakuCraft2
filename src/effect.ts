import {CommentEntity} from './comment';
import {Entity} from './entity';

export class LocallyOriginatedCommentEffectManager {
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
    return new EffectData(effectType, effect.parameter || 0);
  }
}

export class EffectData {
  constructor(public readonly type: number, public readonly parameter: number) {
  }

  toString() {
    return `Type: ${this.type}; Parameter: ${this.parameter}`;
  }
}

export class EffectFactory {
  static build(effectData: EffectData): Effect<Entity> {
    switch (effectData.type) {
      case EffectType.ETHEREAL:
        return Ethereal.getInstance();
      case EffectType.CHROMATIC:
        return new Chromatic();
      default:
        throw new Error(`Invalid effect type: ${effectData}`);
    }
  }
}

enum EffectType {
  ETHEREAL = 0,  // nothing
  CHROMATIC = 1,  // colorful comment
  SHAPELY = 2,  // simple geometry
  GRAPHICAL = 3,  // bitmap image
  KINETIC = 4,  // moving comment
  BLAZING = 5,  // tiny firework
  ELEGANT = 6,  // different font
  // Reserved HASTY = 7,
}

/**
 * Permanently changes the behavior of an {@link Entity}.
 */
export abstract class Effect<E extends Entity> {
  constructor(public readonly parameter?: number) {
  }

  abstract initialize(entity: E): void;
}

/**
 * Nothing.
 */
class Ethereal extends Effect<Entity> {
  private static instance: Ethereal | null;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance == null) {
      this.instance = new this();
    }
    return this.instance;
  }

  initialize(_: Entity): void {
    return undefined;
  }
}

/**
 * Makes a {@link CommentEntity} constantly changes its color.
 */
class Chromatic extends Effect<CommentEntity> {
  initialize(entity: CommentEntity): void {
    // TODO
    throw new Error('Not implemented');
  }
}
