import UniverseProxy from '../../interface/UniverseProxy';
import CommentPlacingPolicy from '../../interface/CommentPlacingPolicy';
import Notifier from '../../../output/notification/Notifier';
import {Phaser} from '../../../util/alias/phaser';
import BackgroundMusicPlayer from '../../../output/audio/BackgroundMusicPlayer';

class UniverseProxyImpl implements UniverseProxy {
  constructor(
      private game: Phaser.Game,
      private commentPlacingPolicy: CommentPlacingPolicy,
      private notifier: Notifier,
      private backgroundMusicPlayer: BackgroundMusicPlayer) {
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

  getBackgroundMusicPlayer() {
    return this.backgroundMusicPlayer;
  }
}

export default UniverseProxyImpl;
