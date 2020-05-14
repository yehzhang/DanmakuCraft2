import environmentSamplingSizeSelector from './environmentSamplingSizeSelector';
import createVisibleEntityNodesSelector from './visibleEntityNodesSelector';

const environmentCommentEntityNodesSelector = createVisibleEntityNodesSelector(
  environmentSamplingSizeSelector,
  (state) => state.commentEntities.index
);

export default environmentCommentEntityNodesSelector;
