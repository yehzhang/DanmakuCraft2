import { Container } from '@inlet/react-pixi';
import * as React from 'react';
import { createSelector } from 'reselect';
import { BoundingBox, fromPoints, showVertices, zip1d } from '../data/boundingBox';
import { showHsl } from '../data/color';
import { empty, map } from '../data/point';
import environmentAwareColorSelector from '../selector/environmentAwareColorSelector';
import environmentCommentEntityNodesSelector from '../selector/environmentCommentEntityNodesSelector';
import visibleCommentEntityNodesSelector from '../selector/visibleCommentEntityNodesSelector';
import existsObject from '../shim/existsObject';
import application from '../shim/pixi/application';
import { useSelector } from '../shim/redux';
import { ConsoleEntry } from '../state';
import ConsoleDisplayListing, { arePointsClose } from './ConsoleDisplayListing';

function ConsoleDisplay() {
  const playerPosition = useSelector((state) => state.player.position, arePointsClose);
  const chest = useSelector((state) => state.chest);
  const consoleEntries = useSelector((state) => state.consoleEntries);
  const visibleCommentEntityCount = useSelector(visibleCommentEntityCountSelector);
  const visibleCommentEntitiesArea = useSelector(visibleCommentEntitiesAreaSelector);
  const environmentCommentEntityCount = useSelector(environmentCommentEntityCountSelector);
  const backgroundColorString = useSelector((state) =>
    showHsl(environmentAwareColorSelector(state))
  );
  const displayLevel = useSelector((state) => state.consoleDisplayLevel);
  if (displayLevel !== 'info') {
    return null;
  }
  return (
    <Container x={5} y={5}>
      {[
        { caption: `FPS: ${Math.round(application.ticker.FPS)}` },
        { caption: 'Player', entityPosition: playerPosition },
        chest.type === 'spawning' && {
          caption: `Chest spawning in ${Math.ceil(chest.spawnInMs / 1000)}`,
        },
        chest.type === 'spawned' && {
          caption: 'Chest',
          entityPosition: chest.chestEntity,
          note: chest.chestEntity.loot ? null : 'opened',
          navigation: true,
        },
        {
          caption: `Visible comment entities: ${visibleCommentEntityCount}`,
        },
        visibleCommentEntitiesArea && {
          caption: `Area: ${showVertices(visibleCommentEntitiesArea)}`,
        },
        {
          caption: `Environment comment entities: ${environmentCommentEntityCount}`,
        },
        {
          caption: `Background color: ${backgroundColorString}`,
        },
        ...Object.values(consoleEntries).sort(compareConsoleEntries),
      ]
        .filter(existsObject)
        .map((consoleEntry, index) => (
          <ConsoleDisplayListing key={index} y={20 * index} {...consoleEntry} />
        ))}
    </Container>
  );
}

function compareConsoleEntries(
  { caption }: ConsoleEntry,
  { caption: caption_ }: ConsoleEntry
): number {
  return caption.localeCompare(caption_);
}

const visibleCommentEntityCountSelector = createSelector(
  visibleCommentEntityNodesSelector,
  (nodes) => nodes.length
);

const environmentCommentEntityCountSelector = createSelector(
  environmentCommentEntityNodesSelector,
  (nodes) => nodes.length
);

const visibleCommentEntitiesAreaSelector = createSelector(
  visibleCommentEntityNodesSelector,
  (nodes) =>
    nodes
      .map((node) => fromPoints(map(node.entity, Math.round), empty))
      .reduce<BoundingBox | null>(
        (area, nodeArea) => (area ? zip1d(area, nodeArea, Math.max, Math.min) : nodeArea),
        null
      )
);

export default ConsoleDisplay;
