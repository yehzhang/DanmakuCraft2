import {Phaser} from './util/alias/phaser';

class PhysicalConstants {
  public static readonly WORLD_SIZE = 40000;

  public static readonly BACKGROUND_SAMPLING_RADIUS = 2000;
  public static readonly BACKGROUND_VISIBILITY_ENGINE_UPDATE_RADIUS = 600;
  public static readonly FOREGROUND_VISIBILITY_ENGINE_UPDATE_RADIUS = 200;

  public static readonly COMMENT_CHUNKS_COUNT = 100;
  public static readonly QUADTREE_MAX_DEPTH =
      Math.floor(Math.log2(PhysicalConstants.WORLD_SIZE / PhysicalConstants.FOREGROUND_VISIBILITY_ENGINE_UPDATE_RADIUS * 2));
  public static readonly UPDATING_COMMENT_CHUNKS_COUNT = 100;
  public static readonly QUADTREE_MAX_VALUES_COUNT = 7;

  public static readonly MAX_UPDATING_COMMENTS_COUNT = 500;

  public static readonly PLAYER_MOVE_PIXELS_PER_SECOND = 216;

  public static readonly COMMENT_BLINK_DURATION_MS = 150;

  public static readonly BACKGROUND_COLORS_COUNT_TO_REACH_MAX_LIGHTNESS = 230;
  public static readonly BACKGROUND_COLORS_COUNT_TO_REACH_MAX_SATURATION = 15;
  public static readonly BACKGROUND_TRANSITION_DURATION_MS = 3 * Phaser.Timer.SECOND;

  public static readonly CHEST_SPAWN_INTERVAL = 120;
  public static readonly HASTY_BOOST_RATIO = 1.4;

  public static readonly NOTIFIER_BUBBLE_DISPLAY_DURATION = 6 * Phaser.Timer.SECOND;

  public static getRenderRadius(gameWidth: number, gameHeight: number): number {
    return Math.ceil(Math.max(gameWidth, gameHeight) / 2
        + this.FOREGROUND_VISIBILITY_ENGINE_UPDATE_RADIUS
        + 200); // TODO handle comments protruding from a chunk
  }
}

export default PhysicalConstants;
