import {EntityManager} from './entity';
import {Effect} from './effect';
import {Entity} from './entity';

export class CommentData {
  constructor(
      public readonly showTime: number,
      public readonly mode: number,
      public readonly size: number,
      public readonly color: number,
      public readonly sendTime: number,
      public readonly userId: number,
      public readonly text: string,
      public readonly positionX: number, // These positions may be invalid.
      public readonly positionY: number,
      public readonly effect: Effect | null) {
  }
}

export class CommentEntityManager {
  private isLoaded: boolean;

  constructor(private entityManager: EntityManager) {
    this.isLoaded = false;
  }

  loadInitialComments(commentsData: CommentData[]) {
    if (this.isLoaded) {
      throw new Error('Initial comments are loaded already');
    }

    // TODO

    this.isLoaded = true;
  }

  loadComment(commentData: CommentData) {

  }

  areInitialCommentsLoaded() {
    return this.isLoaded;
  }
}

export class CommentEntity extends Entity {
  constructor(position: Phaser.Point, private effect: Effect | null) {
    super(position);
  }

  hasEffect() {
    return this.effect != null;
  }

  getEffect() {
    return this.effect;
  }
}
