// TODO add asserting test on validity of constants?
export default class PhysicalConstants {
  public static readonly WORLD_SIZE = 30000; // TODO
  public static readonly BACKGROUND_SAMPLING_RADIUS = 2000; // TODO
  public static readonly COMMENT_CHUNKS_COUNT = 50;
  public static readonly UPDATING_CHUNKS_COUNT = 10; // TODO
  public static readonly PLAYER_MOVE_DISTANCE_PER_SECOND = 216;
  public static readonly COMMENT_BLINK_DURATION_MS = 150;
  private static readonly MAXIMUM_COMMENT_WIDTH = 100; // TODO
  // A comment has anchor in the center.
  public static readonly MAXIMUM_COMMENT_WIDTH_OUTSIDE_CHUNK =
      PhysicalConstants.MAXIMUM_COMMENT_WIDTH / 2;

  public static getRenderRadius(gameWidth: number, gameHeight: number): number {
    let longerSide = Math.max(gameWidth, gameHeight);
    let bufferingDistance = this.PLAYER_MOVE_DISTANCE_PER_SECOND * 2;
    let renderRadius = longerSide + this.MAXIMUM_COMMENT_WIDTH_OUTSIDE_CHUNK + bufferingDistance;
    return Math.ceil(renderRadius * 1.1);
  }
}
