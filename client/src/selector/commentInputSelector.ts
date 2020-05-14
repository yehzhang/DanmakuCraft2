import { createSelector } from 'reselect';
import commentInputCollisionSelector from './commentInputCollisionSelector';
import commentInputPreviewPositionSelector from './commentInputPreviewPositionSelector';

const commentInputSelector = createSelector(
  commentInputPreviewPositionSelector,
  commentInputCollisionSelector,
  (state) => state.commentInputColor,
  (state) => state.commentInputSize,
  (state) => state.sendChromaticComment,
  (position, collision, color, size, chromatic) => ({
    position,
    collision,
    color,
    size,
    chromatic,
  })
);

export default commentInputSelector;
