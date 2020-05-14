import { Sprite } from '@inlet/react-pixi';
import * as _ from 'lodash';
import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { bottom } from '../data/anchors';
import { black, toRgbNumber, white } from '../data/color';
import { distance } from '../data/coordinate';
import { ChestEntity } from '../data/entity';
import { Tween, Tweens } from '../data/tween';
import useTexture from '../hook/useTexture';
import useTweens from '../hook/useTweens';
import { memo } from '../shim/react';
import { useDispatch, useSelector } from '../shim/redux';
import { inOutQuad } from '../shim/tsEasing';

function Chest() {
  const closedTexture = useTexture(drawClosedChest);
  const openTexture = useTexture(drawOpenChest);
  const chestState = useSelector((state) => {
    switch (state.chest.type) {
      case 'initial':
      case 'spawning':
        return null;
      case 'spawned':
        return state.chest;
    }
  });
  if (!chestState) {
    return null;
  }
  const { id, chestEntity } = chestState;
  return (
    <Chest_
      key={id}
      chestEntity={chestEntity}
      closedTexture={closedTexture}
      openTexture={openTexture}
    />
  );
}

interface Props {
  readonly chestEntity: ChestEntity;
  readonly closedTexture: PIXI.Texture;
  readonly openTexture: PIXI.Texture;
}

const Chest_ = ({ chestEntity, closedTexture, openTexture }: Props) => {
  const { x, y, loot } = chestEntity;
  const opening = useOpeningState(chestEntity);
  const [dx, done] = useTweens(opening ? chestOpeningTweens : null, []);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!loot || !done) {
      return;
    }
    dispatch({ type: '[Chest] opened by player', buff: loot });
  }, [loot, dispatch, done]);
  return <Sprite x={x + dx} y={y} anchor={bottom} texture={loot ? closedTexture : openTexture} />;
};

function useOpeningState(chestEntity: ChestEntity): boolean {
  const openingRef = useRef(false);
  const opening = useSelector(
    (state) =>
      openingRef.current ||
      distance(state.player.position, chestEntity) <= playerIntersectionDistance
  );
  if (opening) {
    openingRef.current = true;
  }

  return opening;
}

const chestOpeningTweens: Tweens = [
  getShakingTween(-1, 0.5),
  ..._.times(5, () => [getShakingTween(1, 1), getShakingTween(-1, 1)]).flat(),
  getShakingTween(0, 0.5),
];

function getShakingTween(directionMultiplier: number, progressionMultiplier: number): Tween {
  return {
    to: directionMultiplier * 5 * progressionMultiplier,
    easing: inOutQuad,
    durationMs: 50 * progressionMultiplier,
  };
}

const playerIntersectionDistance = 40;

function drawClosedChest(graphics: PIXI.Graphics) {
  // 73 x 45
  graphics
    // Top
    .beginFill(toRgbNumber(white))
    .lineStyle(3, toRgbNumber(black), 1)
    .drawRoundedRect(0, 0, 73, 25, 10)
    .endFill()

    // Bottom Background
    .lineStyle(0)
    .beginFill(toRgbNumber(white))
    .drawRect(0, 17, 73, 28)
    .endFill()

    // Bottom Silhouette
    .lineStyle(3, toRgbNumber(black), 1)
    .moveTo(0, 17)
    .lineTo(0, 45)
    .lineTo(73, 45)
    .lineTo(73, 17)

    // Crack
    .lineStyle(2, toRgbNumber(black), 1)
    .moveTo(-1, 17)
    .lineTo(75, 17)

    // Lock
    .lineStyle(2, toRgbNumber(black), 1)
    .beginFill(toRgbNumber(white))
    .drawRect(33, 13, 7, 12)
    .endFill();
}

function drawOpenChest(graphics: PIXI.Graphics) {
  graphics
    // Bottom Background
    .lineStyle(0)
    .beginFill(toRgbNumber(white))
    .drawRect(0, 17, 73, 28)
    .endFill()

    // Bottom Silhouette
    .lineStyle(3, toRgbNumber(black), 1)
    .moveTo(0, 17)
    .lineTo(0, 45)
    .lineTo(73, 45)
    .lineTo(73, 17)

    // Crack
    .lineStyle(2, toRgbNumber(black), 1)
    .moveTo(-1, 17)
    .lineTo(75, 17)

    // Lock
    .lineStyle(2, toRgbNumber(black), 1)
    .drawRect(33, 17, 7, 5);
}

export default memo(Chest);
