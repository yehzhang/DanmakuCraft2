import { Action } from '../action';
import { size as textSignSize } from '../component/TextSign';
import {
  fontStyle as worldOriginFontStyle,
  text as worldOriginText,
} from '../component/WorldOrigin';
import { SignEntity } from '../data/entity';
import { Point } from '../data/point';
import measureTextDimensions from '../shim/pixi/measureTextDimensions';
import { EntitiesState } from '../state';
import { buildInitialEntitiesState, updateEntitiesState } from './internal/entityIndex';

function signEntitiesReducer(
  state = buildInitialEntitiesState<SignEntity>(),
  action: Action
): EntitiesState<SignEntity> {
  switch (action.type) {
    case '[Opening] genesis': {
      const { signEntities } = action;
      return updateEntitiesState(state, signEntities, measureDimensions);
    }
    default:
      return state;
  }
}

export function measureDimensions(entity: SignEntity): Point {
  switch (entity.type) {
    case 'spawn_point':
      return measureTextDimensions({
        text: entity.text,
        size: textSignSize,
      });
    case 'world_center':
      // Hard code the size as an easy hack.
      return {
        x: 600,
        y: 600,
      };
    case 'world_origin':
      return measureTextDimensions({
        text: worldOriginText,
        size: textSignSize,
        fontStyle: worldOriginFontStyle,
      });
  }
}

export default signEntitiesReducer;
