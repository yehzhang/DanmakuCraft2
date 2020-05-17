import { Action } from '../action';
import { convergingLerp } from '../data/interpolation';
import { empty, Point, zip3 } from '../data/point';

const initialState: Point = empty;

function cameraPositionReducer(state = initialState, action: Action): Point {
  switch (action.type) {
    case '[Ticker] ticked': {
      const {
        state: {
          player: { position: playerPosition },
        },
      } = action;
      return zip3(state, playerPosition, interpolationParameters, convergingLerp);
    }
    case 'Genesis': {
      const { spawnPosition } = action;
      return spawnPosition;
    }
    default:
      return state;
  }
}

/** Parameter to the interpolation of following. */
const interpolationParameters = {
  x: 0.05,
  y: 0.08,
};

export default cameraPositionReducer;
