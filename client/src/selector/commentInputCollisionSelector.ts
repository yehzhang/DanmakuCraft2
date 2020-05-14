import { createSelector } from 'reselect';
import { centerTo, fromPoints, intersect } from '../data/boundingBox';
import commentInputDimensionsSelector from './commentInputDimensionsSelector';
import visibleCommentEntityNodesSelector from './visibleCommentEntityNodesSelector';

const commentInputCollisionSelector = createSelector(
  commentInputDimensionsSelector,
  (state) => state.player.position,
  visibleCommentEntityNodesSelector,
  (dimensions, position, nodes) => {
    const boundingBox = fromPoints(position, dimensions);
    return nodes.some((node) => intersect(centerTo(node.entity, node), boundingBox));
  }
);

export default commentInputCollisionSelector;
