import partial from 'lodash/partial';
import * as React from 'react';
import { useEffect } from 'react';
import { center } from '../data/anchors';
import { gold } from '../data/color';
import i18nData from '../data/i18n/zh';
import { getPerspective, projectToPerspective } from '../data/perspective';
import { zip } from '../data/point';
import { Tweens } from '../data/tween';
import useTweens from '../hook/useTweens';
import { memo } from '../shim/react';
import { inOutCubic } from '../shim/tsEasing';
import PlainText from './PlainText';

interface Props {
  readonly x: number;
  readonly y: number;
  readonly vanishingPointX: number;
  readonly vanishingPointY: number;
  readonly stage: Stage;
  readonly dispatch: (action: 'Title entered') => void;
}

type Stage = 'entering' | 'exiting';

function OpeningTitle(props: Props) {
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
      dispatch('Title entered');
    }
  }, [done]);

  const alpha = Math.min(perspective * 10, 1);
  return (
    <PlainText
      {...projectedPosition}
      color={gold}
      size={64}
      text={i18nData.title}
      anchor={center}
      alpha={alpha}
      scale={perspective}
    />
  );
}

function getTweens(stage: Stage): Tweens {
  switch (stage) {
    case 'entering':
      return [
        { to: 1000 },
        {
          to: 0,
          easing: inOutCubic,
          durationMs: 3000,
        },
      ];
    case 'exiting':
      return [
        {
          to: -9.9,
          easing: inOutCubic,
          durationMs: 3500,
        },
      ];
  }
}

export default memo(OpeningTitle);
