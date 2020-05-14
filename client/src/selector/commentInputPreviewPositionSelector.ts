import { createSelector } from 'reselect';
import { map } from '../data/point';
import { State } from '../state';

const commentInputPreviewPositionSelector = createSelector(
  (state: State) => state.player.position,
  (playerPosition) => map(playerPosition, Math.round)
);

export default commentInputPreviewPositionSelector;
