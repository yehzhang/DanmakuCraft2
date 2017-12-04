import EntityFactory from './EntityFactory';
import EntityTracker from '../update/entityTracker/EntityTracker';
import {CommentData, CommentEntity} from './comment';
import EntityManager from './EntityManager';
import CommentProvider from '../environment/CommentProvider';

/**
 * Loads comment entities to the world and provides helper functions to manipulate comments.
 * Comment entities are treated specially because they are the only entities added dynamically.
 */
export default class CommentManager {
  constructor(
      private entityManager: EntityManager<CommentEntity>,
      private entityTracker: EntityTracker,
      private entityFactory: EntityFactory) {
    if (!entityTracker.isTracking(entityManager)) {
      throw new Error('EntityManager is not tracked');
    }
  }

  canPlaceCommentIn(bounds: Phaser.Rectangle): boolean {
    return !this.entityTracker.getCurrentRegions(this.entityManager)
        .some(region => {
          let hasCollision = false;
          region.forEach(commentEntity => {
            if (hasCollision) {
              return;
            }
            hasCollision = commentEntity.measure().textBounds.intersects(bounds, 0);
          });

          return hasCollision;
        });
  }

  loadBatch(commentsData: CommentData[]) {
    let comments = commentsData.map(this.entityFactory.createCommentEntity, this);
    this.entityManager.loadBatch(comments);
    return comments;
  }

  load(commentData: CommentData) {
    let comment = this.entityFactory.createCommentEntity(commentData);
    this.entityManager.load(comment);
    return comment;
  }

  listenTo(commentProvider: CommentProvider) {
    commentProvider.addEventListener(CommentProvider.NEW_COMMENT, this.load, this);
  }
}
