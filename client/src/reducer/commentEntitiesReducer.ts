import { Action } from '../action';
import { white } from '../data/color';
import { CommentEntity } from '../data/entity';
import measureTextDimensions from '../shim/pixi/measureTextDimensions';
import { EntitiesState } from '../state';
import { buildInitialEntitiesState, updateEntitiesState } from './internal/entityIndex';

function commentEntitiesReducer(
  state = buildInitialEntitiesState<CommentEntity>(),
  action: Action
): EntitiesState<CommentEntity> {
  switch (action.type) {
    case '[CommentTextInput] submitted': {
      const { data } = action;
      return updateState(state, [data]);
    }
    case '[index] Comments loaded from backend': {
      const { data } = action;
      return updateState(state, data);
    }
    case '[ConsoleInput] chromatic comment wanted': {
      const { position, text } = action;
      return updateState(state, [
        createDevComment({
          ...position,
          type: 'chromatic',
          text,
        }),
      ]);
    }
    case '[ConsoleInput] comment wanted': {
      const { position, text, color } = action;
      return updateState(state, [
        createDevComment({
          ...position,
          text,
          color,
        }),
      ]);
    }
    case '[Opening] Genesis':
      return buildInitialEntitiesState();
    default:
      return state;
  }
}

function updateState(
  state: EntitiesState<CommentEntity>,
  newData: readonly CommentEntity[]
): EntitiesState<CommentEntity> {
  return updateEntitiesState<CommentEntity>(state, newData, measureTextDimensions);
}

function createDevComment(data: Partial<CommentEntity>): CommentEntity {
  return {
    type: 'plain',
    text: '',
    size: 25,
    color: white,
    x: 0,
    y: 0,
    createdAt: new Date(),
    ...data,
  };
}

export default commentEntitiesReducer;
