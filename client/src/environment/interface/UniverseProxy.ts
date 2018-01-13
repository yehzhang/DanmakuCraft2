import CommentPlacingPolicy from './CommentPlacingPolicy';
import Notifier from '../../output/notification/Notifier';
import {Phaser} from '../../util/alias/phaser';

interface UniverseProxy {
  getCommentPlacingPolicy(): CommentPlacingPolicy;

  getNotifier(): Notifier;

  getGame(): Phaser.Game;
}

export default UniverseProxy;
