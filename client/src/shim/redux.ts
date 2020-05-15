import * as ReactRedux from 'react-redux';
import * as Redux from 'redux';
import { Action } from '../action';
import { State } from '../state';

export const useDispatch: UseDispatch = ReactRedux.useDispatch;

export const useSelector: UseSelector = __DEV__ ? lazyModuleUseSelector : ReactRedux.useSelector;

type UseDispatch = () => Dispatch;
export type Dispatch = (action: Action) => void;

type UseSelector = <T>(selector: Selector<T>, equalityFn?: (left: T, right: T) => boolean) => T;
export type Selector<R> = (state: State) => R;

export type Store = Redux.Store<State, Action>;

// A hack to get whyDidYouRender to work.
function lazyModuleUseSelector<T>(
  selector: Selector<T>,
  equalityFn?: (left: T, right: T) => boolean
): T {
  return ReactRedux.useSelector(selector, equalityFn);
}
