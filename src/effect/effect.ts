import {CommentEntity} from '../entity/comment';
import {Entity} from '../entity/entity';

/**
 * Permanently changes the behavior of an {@link Entity}.
 */
export abstract class Effect<T extends Entity> {
  readonly parameter: number;

  constructor(parameter?: number) {
    this.parameter = parameter || 0;
  }

  abstract apply(entity: T): void;
}

/**
 * Nothing.
 */
export class Ethereal extends Effect<Entity> {
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

  apply(_: Entity): void {
    return undefined;
  }
}

/**
 * Makes a {@link CommentEntity} constantly changes its color.
 */
export class Chromatic extends Effect<CommentEntity> {
  apply(entity: CommentEntity): void {
    // TODO
    throw new Error('Not implemented');
  }
}
