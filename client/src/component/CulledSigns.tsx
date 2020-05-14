import * as React from 'react';
import createVisibleEntityNodesSelector, {
  equalEntityNodeArrays,
} from '../selector/visibleEntityNodesSelector';
import { useSelector } from '../shim/redux';
import Sign from './Sign';

function CulledSigns() {
  const signEntityNodes = useSelector(visibleSignEntityNodesSelector, equalEntityNodeArrays);
  return (
    <>
      {signEntityNodes.map(({ id, entity: signEntity }) => (
        <Sign key={id} entity={signEntity} />
      ))}
    </>
  );
}

const visibleSignEntityNodesSelector = createVisibleEntityNodesSelector(
  (state) => state.containerSize,
  (state) => state.signEntities.index
);

export default CulledSigns;
