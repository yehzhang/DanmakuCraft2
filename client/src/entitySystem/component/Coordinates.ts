import Point from '../../util/syntax/Point';

interface Coordinates {
  /**
   * Returns internal coordinates. Modifying them directly may or may not change the internal ones.
   */
  readonly coordinates: Point;
}

export default Coordinates;
