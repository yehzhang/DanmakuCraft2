import { createSelector } from 'reselect';
import { empty, Point, zip } from '../data/point';
import { State } from '../state';

const visibilityAnchorSelector = createSelector(
  (state: State) => state.cameraPosition,
  (cameraPosition) => {
    const { x: xClose, y: yClose } = zip(cameraPosition, lastCameraPosition, areCoordinatesClose);
    if (!xClose || !yClose) {
      lastCameraPosition = cameraPosition;
    }
    return lastCameraPosition;
  }
);

let lastCameraPosition: Point = empty;

/** Returns whether two coordinates are close enough to skip visibility updates. */
function areCoordinatesClose(x: number, x_: number): boolean {
  return Math.abs(x - x_) < minDistanceToRefreshVisibility;
}

export const minDistanceToRefreshVisibility = 100;

export default visibilityAnchorSelector;
