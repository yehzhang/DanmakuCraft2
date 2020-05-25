import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import reducer from './reducer';
import { Store } from './shim/redux';
import { State } from './state';

const stateSanitizer = (state: State): any => {
  const {
    movement: movementIgnored,
    hastyRemainingMs: hastyRemainingMsIgnored,
    containerSize: containerSizeIgnored,
    commentEntities: commentEntitiesIgnored,
    signEntities: signEntitiesIgnored,
    consoleEntries: consoleEntriesIgnored,
    commentInputText: commentInputTextIgnored,
    ...state_
  } = state;
  return state_;
};

const compose = composeWithDevTools({
  actionsBlacklist: [
    '\\[Ticker]',
    '\\[PixiStage] (up|down|left|right)',
    '\\[Console]',
    '[index] comments loaded',
    'Console entry used',
    'Console entry released',
  ],
  stateSanitizer: stateSanitizer as any,
});

const persistWhitelist: (keyof State)[] = ['volume', 'tutorial'];

const persistConfig: PersistConfig<State> = {
  key: 'danmakucraft:root',
  storage,
  serialize: true,
  whitelist: persistWhitelist,
};

const store: Store = createStore(persistReducer(persistConfig, reducer), compose());

export const persistor = persistStore(store);

export default store;
