import EntityTracker from '../update/EntityTracker';
import EntityFinder from '../util/entityFinder/EntityFinder';
import CommentProvider from '../environment/interface/CommentProvider';
import {CommentEntity} from '../entitySystem/alias';
import EntityFactory from '../entitySystem/EntityFactory';
import CommentData from './CommentData';

/**
 * Loads comment entities to the world and provides helper functions to manipulate comments.
 * Comment entities are treated specially because they are the only entities added dynamically.
 */
class CommentManager { // TODO test
  constructor(
      private entityFinder: EntityFinder<CommentEntity>,
      private entityTracker: EntityTracker<any, any>,
      private entityFactory: EntityFactory) {
    if (!entityTracker.isTracking(entityFinder)) {
      throw new Error('EntityFinder is not tracked');
    }
  }

  canPlaceCommentIn(bounds: Phaser.Rectangle): boolean {
    let currentRegions = this.entityTracker.getCurrentRegions(this.entityFinder);
    for (let region of currentRegions) {
      for (let entity of region.container) {
        if (entity.display.textBounds.intersects(bounds, 0)) {
          return false;
        }
      }
    }
    return true;
  }

  loadBatch(commentsData: CommentData[]) {
    let comments = commentsData.map(this.entityFactory.createCommentEntity, this.entityFactory);
    this.entityFinder.loadBatch(comments);
    return comments;
  }

  load(commentData: CommentData) {
    let comment = this.entityFactory.createCommentEntity(commentData);
    this.entityFinder.load(comment);
    return comment;
  }

  listenTo(commentProvider: CommentProvider) {
    commentProvider.addEventListener(CommentProvider.NEW_COMMENT, this.load, this);
  }
}

export default CommentManager;
