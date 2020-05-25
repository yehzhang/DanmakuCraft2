import { fromPoints } from '../../data/boundingBox';
import { RBushEntityIndex } from '../../data/entityIndex';
import { map, Point } from '../../data/point';
import { getWorldCoordinate } from '../../data/unboundedWorld';
import { EntitiesState, IdKeyed } from '../../state';

export function buildInitialEntitiesState<T>(): EntitiesState<T> {
  return {
    data: {},
    index: new RBushEntityIndex<T>(),
  };
}

export function updateEntitiesState<T extends Point>(
  state: EntitiesState<T>,
  newData: IdKeyed<T>,
  measureDimensions: (entity: T) => Point
): EntitiesState<T> {
  const { data, index } = state;
  return {
    ...state,
    data: {
      ...data,
      ...newData,
    },
    index: index.load(
      Object.entries(newData).map(([id, entity]) =>
        Object.assign(fromPoints(map(entity, getWorldCoordinate), measureDimensions(entity)), {
          id,
          entity,
        })
      )
    ),
  };
}
