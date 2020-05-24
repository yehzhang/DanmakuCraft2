import { Action } from '../action';
import { empty, equal, map, Point } from '../data/point';
import { MovementState, PlayerState, State } from '../state';

const initialState: PlayerState = {
  position: empty,
  pixelStepping: null,
  fly: false,
};

function playerReducer(state = initialState, action: Action): PlayerState {
  switch (action.type) {
    case '[Ticker] ticked': {
      const { deltaMs, state: state_ } = action;
      return updateStateByTick(state, deltaMs, state_);
    }
    case '[ConsoleInput] player flying toggled': {
      const { state: fly } = action;
      return {
        ...state,
        fly,
      };
    }
    case '[Opening] genesis': {
      const { spawnPosition } = action;
      return {
        ...initialState,
        position: spawnPosition,
      };
    }
    default:
      return state;
  }
}

const baseSpeed = 216 / 1000; // 216 pixels per second

function updateStateByTick(
  { position, pixelStepping, fly }: PlayerState,
  deltaMs: number,
  { movement, hastyRemainingMs }: State
): PlayerState {
  const speedBoostRatio = fly ? 20 : hastyRemainingMs > 0 ? 1.4 : 1;
  const distance = baseSpeed * speedBoostRatio * deltaMs;
  const nextPosition = updatePositionByMovement(position, movement, distance);
  if (equal(nextPosition, position)) {
    return {
      position: pixelStepping && pixelStepping.expireInMs > 0 ? pixelStepping.startPoint : position,
      pixelStepping: null,
      fly,
    };
  }

  if (pixelStepping) {
    // Update existing pixel stepping state.
    return {
      position: nextPosition,
      pixelStepping: {
        ...pixelStepping,
        expireInMs: pixelStepping.expireInMs - deltaMs,
      },
      fly,
    };
  }
  // Create new pixel stepping state.
  return {
    position: nextPosition,
    pixelStepping: {
      startPoint: map(updatePositionByMovement(position, movement, 1), Math.round),
      expireInMs: 70,
    },
    fly,
  };
}

function updatePositionByMovement(
  { x, y }: Point,
  { up, down, left, right }: MovementState,
  distance: number
): Point {
  return {
    x: x + (left ? -distance : 0) + (right ? distance : 0),
    y: y + (up ? -distance : 0) + (down ? distance : 0),
  };
}

export default playerReducer;
