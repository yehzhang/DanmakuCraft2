import PermanentlyUpdatingBuff from './PermanentlyUpdatingBuff';
import {UpdatingCommentEntity} from '../../alias';

/**
 * Makes a {@link CommentEntity} constantly change its color.
 */
class Chromatic extends PermanentlyUpdatingBuff<UpdatingCommentEntity> {
  tick(commentEntity: UpdatingCommentEntity, time: Phaser.Time) {
    // TODO
    throw new Error('Not Implemented');
  }
}

export default Chromatic;
