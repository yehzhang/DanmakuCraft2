import {Phaser} from './util/alias/phaser';

class PhysicalConstants {
  public static readonly WORLD_SIZE = 40000;

  public static readonly COMMENT_CHUNKS_COUNT = 50;
  public static readonly UPDATING_COMMENT_CHUNKS_COUNT = 20;
  public static readonly CHUNK_SIZE =
      PhysicalConstants.WORLD_SIZE / PhysicalConstants.COMMENT_CHUNKS_COUNT;

  public static readonly BACKGROUND_SAMPLING_RADIUS = 3100;
  public static readonly ENTITY_TRACKER_UPDATE_RADIUS = PhysicalConstants.CHUNK_SIZE;

  public static readonly PLAYER_MOVE_DISTANCE_PER_SECOND = 216;

  public static readonly COMMENT_BLINK_DURATION_MS = 150;

  public static readonly BACKGROUND_COLORS_COUNT_TO_REACH_MAX_LIGHTNESS = 300;
  public static readonly BACKGROUND_COLORS_COUNT_TO_REACH_MAX_SATURATION = 15;
  public static readonly BACKGROUND_TRANSITION_DURATION_MS = 3 * Phaser.Timer.SECOND;

  public static readonly CHEST_SPAWN_INTERVAL = 120;
  public static readonly HASTY_BOOST_RATIO = 1.4;

  public static getRenderRadius(gameWidth: number, gameHeight: number): number {
    return Math.ceil(Math.max(gameWidth, gameHeight) / 2
        + this.ENTITY_TRACKER_UPDATE_RADIUS
        + 200); // TODO handle comments protruding from a chunk
  }
}

export default PhysicalConstants;
