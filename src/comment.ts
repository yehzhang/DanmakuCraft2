import {EntityManager} from './entity';
import {Effect, EffectData, EffectFactory} from './effect';
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
      public readonly coordinateX: number, // These positions may be invalid.
      public readonly coordinateY: number,
      public readonly effectData: EffectData | null) {
  }
}

export class CommentManager {
  private isLoaded: boolean;

  constructor(private entityManager: EntityManager) {
    this.isLoaded = false;
  }

  loadInitialComments(commentsData: CommentData[]) {
    if (this.isLoaded) {
      throw new Error('Initial comments are loaded already');
    }

    let comments = commentsData.map(CommentManager.buildComment);
    this.entityManager.loadBatch(comments);

    this.isLoaded = true;
  }

  loadComment(commentData: CommentData) {
    let comment = CommentManager.buildComment(commentData);
    this.entityManager.load(comment);
  }

  private static buildComment(data: CommentData) {
    let coordinate = new Phaser.Point(data.coordinateX, data.coordinateY);
    let comment = new CommentEntity(data.size, data.color, data.text, coordinate);

    if (data.effectData != null) {
      let effect = EffectFactory.build(data.effectData);
      effect.initialize(comment);
    }

    return comment;
  }

  areInitialCommentsLoaded() {
    return this.isLoaded;
  }

  canPlaceComment(commentText: string, commentSize: number): boolean {
    // TODO
    throw new Error('Not implemented');
  }
}

export class CommentEntity extends Entity {
  constructor(
      private size: number,
      private color: number,
      private text: string,
      coordinate: Phaser.Point) {
    super(coordinate);
  }
}
