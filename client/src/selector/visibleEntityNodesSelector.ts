import clamp from 'lodash/clamp';
import { createSelector } from 'reselect';
import { BoundingBox, inflatePoint } from '../data/boundingBox';
import { EntityIndex, EntityIndexNode } from '../data/entityIndex';
import { map, Point, zip } from '../data/point';
import { getWorldCoordinate, getWorldDistance, worldSize } from '../data/unboundedWorld';
import { Selector } from '../shim/redux';
import visibilityAnchorSelector, {
  minDistanceToRefreshVisibility,
} from './visibilityAnchorSelector';

/** Creates a selector of entities visible in the camera. This is effectively culling. */
function createVisibleEntityNodesSelector<T extends Point>(
  visibilitySelector: Selector<Point>,
  entityIndexSelector: Selector<EntityIndex<T>>
): Selector<EntityIndexNode<T>[]> {
  return createSelector(
    visibilityAnchorSelector,
    visibilitySelector,
    entityIndexSelector,
    (visibilityAnchor, visibility, entityIndex) =>
      getVisibleAreasAroundCoordinates(visibilityAnchor, visibility)
        .flatMap((area) => entityIndex.search(area))
        .map((node) => ({
          ...node,
          entity: {
            ...node.entity,
            ...zip(visibilityAnchor, node.entity, getClosestWorldCoordinateToAnchor),
          },
        }))
  );
}

export function equalEntityNodeArrays<T>(nodes: readonly T[], nodes_: readonly T[]): boolean {
  return (nodes.length === 0 && nodes_.length === 0) || nodes === nodes_;
}

function getVisibleAreasAroundCoordinates(coordinates: Point, visibility: Point): BoundingBox[] {
  const { x, y } = map(coordinates, getWorldCoordinate);
  const safeVisibility = map(visibility, (dx) =>
    clamp(dx / 2 + minDistanceToRefreshVisibility, 0, maxSafeVisibility)
  );
  return congruentOffsets.flatMap((dx) =>
    congruentOffsets.map((dy) => {
      const congruentPosition = { x: x + dx, y: y + dy };
      return inflatePoint(congruentPosition, safeVisibility);
    })
  );
}

const congruentOffsets = [-worldSize, 0, worldSize];

const maxSafeVisibility = worldSize / 2 - Number.EPSILON;

function getClosestWorldCoordinateToAnchor(anchor: number, coordinate: number): number {
  return getWorldDistance(coordinate, anchor) + anchor;
}

export default createVisibleEntityNodesSelector;
