import add from 'lodash/add';
import sample from 'lodash/sample';
import times from 'lodash/times';
import { nanoid } from 'nanoid';
import { Action } from '../action';
import {
  maxChestSpawnIntervalMs,
  maxInitialChestSpawnIntervalMs,
  minChestSpawnIntervalMs,
  minInitialChestSpawnIntervalMs,
} from '../data/chest';
import { distance, magnitude, polarToCartesian } from '../data/coordinate';
import { lerp } from '../data/interpolation';
import { Point, zip } from '../data/point';
import { ChestState, State } from '../state';

const initialState: ChestState = {
  type: 'initial',
};

function chestReducer(state = initialState, action: Action): ChestState {
  switch (action.type) {
    case '[Ticker] ticked': {
      const { deltaMs, state: state_ } = action;
      return updateByTick(state, deltaMs, state_);
    }
    case '[Chest] opened by player': {
      return openChest(state);
    }
    case '[ConsoleInput] chest wanted': {
      const {
        position: { x, y },
        lootType,
      } = action;
      return {
        type: 'spawned',
        id: nanoid(),
        chestEntity: {
          x,
          y: y - 50,
          loot: { type: lootType },
        },
      };
    }
    case '[Opening] genesis':
      return initialState;
    default:
      return state;
  }
}

function updateByTick(
  state: ChestState,
  deltaMs: number,
  { cameraPosition, containerSize }: State
): ChestState {
  switch (state.type) {
    case 'initial':
      return {
        type: 'spawning',
        spawnInMs: lerp(
          minInitialChestSpawnIntervalMs,
          maxInitialChestSpawnIntervalMs,
          Math.random()
        ),
      };
    case 'spawning': {
      const { spawnInMs } = state;
      const nextSpawnInMs = spawnInMs - deltaMs;
      if (nextSpawnInMs > 0) {
        return {
          ...state,
          spawnInMs: nextSpawnInMs,
        };
      }

      const safeRadius = getSafeChestSpawningRadius(containerSize);
      return {
        type: 'spawned',
        id: nanoid(),
        chestEntity: {
          ...generateChestPositionAround(cameraPosition, safeRadius),
          loot: { type: sample(buffDistribution) || 'none' },
        },
      };
    }
    case 'spawned': {
      const { chestEntity } = state;
      const { loot } = chestEntity;
      const chestToPlayerDistance = distance(cameraPosition, chestEntity);
      const safeRadius = getSafeChestSpawningRadius(containerSize);
      if (chestToPlayerDistance <= safeRadius + 1) {
        return state;
      }

      return loot
        ? {
            ...state,
            chestEntity: {
              ...chestEntity,
              ...generateChestPositionAround(cameraPosition, safeRadius),
            },
          }
        : {
            type: 'spawning',
            spawnInMs: lerp(minChestSpawnIntervalMs, maxChestSpawnIntervalMs, Math.random()),
          };
    }
  }
}

function openChest(state: ChestState): ChestState {
  switch (state.type) {
    case 'initial':
    case 'spawning':
      return state;
    case 'spawned': {
      const { chestEntity } = state;
      return {
        ...state,
        chestEntity: {
          ...chestEntity,
          loot: null,
        },
      };
    }
  }
}

function generateChestPositionAround(point: Point, radius: number): Point {
  const sampledAzimuth = Math.random() * Math.PI * 2;
  const sampledOffsets = polarToCartesian({
    azimuth: sampledAzimuth,
    radius,
  });
  return zip(point, sampledOffsets, add);
}

/** Radius out of which it is safe to spawn or despawn a chest (without user noticing). */
function getSafeChestSpawningRadius(visibility: Point): number {
  return magnitude(visibility) / 2 + 100;
}

const buffDistribution = [
  'none',
  'chromatic',
  'chromatic',
  ...times(7, () => 'hasty' as const),
] as const;

export default chestReducer;
