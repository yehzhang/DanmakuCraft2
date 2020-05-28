import { Sprite } from '@inlet/react-pixi';
import partial from 'lodash/partial';
import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect } from 'react';
import { center } from '../data/anchors';
import { getPerspective, projectToPerspective } from '../data/perspective';
import { zip } from '../data/point';
import { Tweens } from '../data/tween';
import { worldSize } from '../data/unboundedWorld';
import useTweens from '../hook/useTweens';
import { memo } from '../shim/react';
import { inOutCubic } from '../shim/tsEasing';

interface Props {
  readonly x: number;
  readonly y: number;
  readonly vanishingPointX: number;
  readonly vanishingPointY: number;
  readonly stage: Stage;
  readonly dispatch: (action: 'Planet entered') => void;
}

type Stage = 'entering' | 'exiting';

function DanmakuPlanet(props: Props) {
  const { vanishingPointX, vanishingPointY, stage, dispatch } = props;
  const [z, done] = useTweens(getTweens(stage), [stage]);
  const perspective = getPerspective(z);
  const projectedPosition = zip(
    props,
    { x: vanishingPointX, y: vanishingPointY },
    partial(projectToPerspective, perspective)
  );

  useEffect(() => {
    if (stage === 'entering' && done) {
      dispatch('Planet entered');
    }
  }, [done]);

  const alpha = Math.min(perspective * 10, 1);
  return (
    <Sprite
      texture={PIXI.Texture.WHITE}
      {...projectedPosition}
      width={worldSize}
      height={worldSize}
      anchor={center}
      alpha={alpha}
      scale={perspective}
    />
  );
}

function getTweens(stage: Stage): Tweens {
  const midpointZ = -5;
  switch (stage) {
    case 'entering':
      return [
        { to: 1000 },
        {
          to: midpointZ,
          easing: inOutCubic,
          durationMs: 3000,
        },
      ];
    case 'exiting':
      return [
        { to: midpointZ },
        {
          to: -9.85,
          easing: inOutCubic,
          durationMs: 3500,
        },
      ];
  }
}

export default memo(DanmakuPlanet);
