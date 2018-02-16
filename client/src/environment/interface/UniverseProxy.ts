import CommentPlacingPolicy from './CommentPlacingPolicy';
import Notifier from '../../output/notification/Notifier';
import {Phaser} from '../../util/alias/phaser';
import BackgroundMusicPlayer from '../../output/audio/BackgroundMusicPlayer';

interface UniverseProxy {
  getCommentPlacingPolicy(): CommentPlacingPolicy;

  getNotifier(): Notifier;

  getGame(): Phaser.Game;

  getBackgroundMusicPlayer(): BackgroundMusicPlayer;
}

export default UniverseProxy;
