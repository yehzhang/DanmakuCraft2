import { Action } from '../action';
import { CommentEntity } from '../data/entity';
import measureTextDimensions from '../shim/pixi/measureTextDimensions';
import { EntitiesState, IdKeyed } from '../state';
import { buildInitialEntitiesState, updateEntitiesState } from './internal/entityIndex';

function commentEntitiesReducer(
  state = buildInitialEntitiesState<CommentEntity>(),
  action: Action
): EntitiesState<CommentEntity> {
  switch (action.type) {
    case '[index] comment entities loaded': {
      const { commentEntities } = action;
      return updateState(state, commentEntities);
    }
    case '[CommentTextInput] submitted':
    case '[ConsoleInput] chromatic comment wanted':
    case '[ConsoleInput] comment wanted': {
      const { id, commentEntity } = action;
      return updateState(state, { [id]: commentEntity });
    }
    case '[Opening] genesis':
      return buildInitialEntitiesState();
    default:
      return state;
  }
}

function updateState(
  state: EntitiesState<CommentEntity>,
  newData: IdKeyed<CommentEntity>
): EntitiesState<CommentEntity> {
  return updateEntitiesState<CommentEntity>(state, newData, measureTextDimensions);
}

export default commentEntitiesReducer;
