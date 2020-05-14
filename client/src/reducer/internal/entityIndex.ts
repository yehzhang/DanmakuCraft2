import { fromPoints } from '../../data/boundingBox';
import { RBushEntityIndex } from '../../data/entityIndex';
import { map, Point } from '../../data/point';
import { getWorldCoordinate } from '../../data/unboundedWorld';
import { EntitiesState } from '../../state';

export function buildInitialEntitiesState<T>(): EntitiesState<T> {
  return {
    data: [],
    index: new RBushEntityIndex<T>(),
  };
}

export function updateEntitiesState<T extends Point>(
  state: EntitiesState<T>,
  newData: readonly T[],
  measureDimensions: (entity: T) => Point
): EntitiesState<T> {
  if (!newData.length) {
    return state;
  }

  const { data, index } = state;
  return {
    ...state,
    data: data.concat(newData),
    index: index.load(
      newData.map((entity, elementIndex) =>
        Object.assign(fromPoints(map(entity, getWorldCoordinate), measureDimensions(entity)), {
          id: data.length + elementIndex,
          entity,
        })
      )
    ),
  };
}
