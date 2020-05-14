import { Action } from '../action';
import { empty, equal, Point } from '../data/point';

const initialState: Point = empty;

function containerSizeReducer(state = initialState, action: Action): Point {
  switch (action.type) {
    case '[LayoutSizeDetector] resized': {
      const { size } = action;
      return equal(size, state) ? state : size;
    }
    default:
      return state;
  }
}

export default containerSizeReducer;
