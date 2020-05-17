import { Action } from '../action';
import { maxChestSpawnIntervalMs, minChestSpawnIntervalMs } from '../data/chest';

const initialState = 0;

function hastyRemainingMsReducer(state = initialState, action: Action): number {
  switch (action.type) {
    case '[Ticker] ticked': {
      const { deltaMs } = action;
      return state - deltaMs;
    }
    case '[Chest] opened by player': {
      const { buff } = action;
      return buff.type === 'hasty' ? hastyDurationMs : state;
    }
    case 'Genesis':
      return initialState;
    default:
      return state;
  }
}

const hastyDurationMs = ((maxChestSpawnIntervalMs - minChestSpawnIntervalMs) / 2) * 0.9;

export default hastyRemainingMsReducer;
