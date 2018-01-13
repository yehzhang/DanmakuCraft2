import UniverseProxy from '../../interface/UniverseProxy';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import Notifier from '../../../output/notification/Notifier';
import {Phaser} from '../../../util/alias/phaser';

class UniverseProxyImpl implements UniverseProxy {
  constructor(
      private game: Phaser.Game,
      private commentPlacingPolicy: CommentPlacingPolicy,
      private notifier: Notifier) {
  }

  getCommentPlacingPolicy() {
    return this.commentPlacingPolicy;
  }

  getNotifier(): Notifier {
    return this.notifier;
  }

  getGame() {
    return this.game;
  }
}

export default UniverseProxyImpl;
