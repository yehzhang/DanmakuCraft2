import { createSelector } from 'reselect';
import measureTextDimensions from '../shim/pixi/measureTextDimensions';
import trimmedCommentInputSelector from './trimmedCommentInputSelector';

const commentInputDimensionsSelector = createSelector(
  trimmedCommentInputSelector,
  (state) => state.commentInputSize,
  (text, size) => measureTextDimensions({ text, size })
);

export default commentInputDimensionsSelector;
