import {CommentEntity} from './comment';

export class EffectManager {
  private activatedEffects: Effect[];

  constructor(private maxActivatedEffectsCount: number) {
    this.activatedEffects = [];
  }

  activate(effect: Effect) {
    this.activatedEffects.push(effect);
    if (this.activatedEffects.length > this.maxActivatedEffectsCount) {
      this.activatedEffects.shift();
    }
  }

  apply(comment: CommentEntity): boolean {
    for (let i = 0; i < this.activatedEffects.length; i++) {
      let effect = this.activatedEffects[i];
      if (effect.apply(comment)) {
        this.activatedEffects.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}

export class EffectFactory {
  static build(type: number, parameter: number | null): Effect {
    switch (type) {
      case EffectType.ETHEREAL:
        return Ethereal.getInstance();
      case EffectType.CHROMATIC:
        return new Chromatic();
      default:
        throw new Error(`Invalid effect type: ${type}`);
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

export interface Effect {
  apply(comment: CommentEntity): boolean;
}

class Chromatic implements Effect {
  apply(comment: CommentEntity): boolean {
    // TODO
    throw new Error('Method not implemented.');
  }
}

class Ethereal implements Effect {
  private static instance: Ethereal | null;

  private constructor() {
  }

  static getInstance() {
    if (this.instance == null) {
      this.instance = new this();
    }
    return this.instance;
  }

  apply(comment: CommentEntity): boolean {
    return true;
  }
}
