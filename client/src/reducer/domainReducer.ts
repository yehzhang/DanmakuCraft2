import { Action } from '../action';
import { selectDomain } from '../shim/domain';
import { DomainState } from '../state';

const initialState: DomainState = selectDomain({
  danmakucraft: { type: 'danmakucraft' },
  bilibili: { type: 'bilibili', externalDependency: null },
});

function domainReducer(state = initialState, action: Action): DomainState {
  switch (action.type) {
    case '[shim/bilibili] external dependency ready': {
      const { $ } = action;
      return state.type === 'bilibili' ? { ...state, externalDependency: { $ } } : state;
    }
    default:
      return state;
  }
}

export default domainReducer;
