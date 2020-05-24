import { Action } from '../action';
import { selectDomain } from '../shim/domain';
import { DomainState } from '../state';

const initialState: DomainState = selectDomain({
  danmakucraft: { type: 'danmakucraft' },
  bilibili: { type: 'bilibili', externalDependency: null, userId: null },
});

function domainReducer(state = initialState, action: Action): DomainState {
  switch (action.type) {
    case '[shim/bilibili] external dependency ready': {
      const { $ } = action;
      return state.type === 'bilibili' ? { ...state, externalDependency: { $ } } : state;
    }
    case '[shim/bilibili] detected maybe signed-in user': {
      const { userId } = action;
      return state.type === 'bilibili' ? { ...state, userId } : state;
    }
    default:
      return state;
  }
}

export default domainReducer;
