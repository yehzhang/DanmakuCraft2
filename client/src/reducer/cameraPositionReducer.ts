import divide from 'lodash/divide';
import { Action } from '../action';
import { convergingLerp } from '../data/interpolation';
import { empty, equal, fromNumber, Point, zip, zip3 } from '../data/point';

const initialState: Point = empty;

function cameraPositionReducer(state = initialState, action: Action): Point {
  switch (action.type) {
    case '[Ticker] ticked': {
      const {
        state: {
          player: { position: playerPosition },
        },
        deltaMs,
      } = action;
      return update(state, playerPosition, deltaMs);
    }
    case '[Opening] genesis': {
      const { spawnPosition } = action;
      return spawnPosition;
    }
    default:
      return state;
  }
}

function update(state: Point, playerPosition: Point, deltaMs: number): Point {
  const t = zip(fromNumber(deltaMs), msToReachMaxOffset, divide);
  const nextState = zip3(state, playerPosition, t, convergingLerp);
  return equal(nextState, state) ? state : nextState;
}

/** Parameter to the interpolation of following. */
const msToReachMaxOffset = {
  x: 1000 / 3,
  y: 1000 / 4.8,
};

export default cameraPositionReducer;
