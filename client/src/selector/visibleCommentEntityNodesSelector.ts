import createVisibleEntityNodesSelector from './visibleEntityNodesSelector';

const visibleCommentEntityNodesSelector = createVisibleEntityNodesSelector(
  (state) => state.containerSize,
  (state) => state.commentEntities.index
);

export default visibleCommentEntityNodesSelector;
