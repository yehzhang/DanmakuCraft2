import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Color } from '../data/color';
import { Tweens } from '../data/tween';
import useTweens from '../hook/useTweens';
import { memo } from '../shim/react';
import { PointLike } from '../shim/reactPixi';
import { inQuad, outQuad } from '../shim/tsEasing';
import PlainText from './PlainText';

interface Props {
  readonly x: number;
  readonly y: number;
  /** Text will fade out if `null`. */
  readonly text: string | null;
  readonly color: Color;
  readonly size: number;
  readonly anchor: PointLike;
}

function FadeTransitionText(props: Props) {
  const { text } = props;
  const currentTextRef = useRef(text);
  const [visible, setVisible] = useState(text !== null);
  const previouslyVisibleRef = useRef(visible);
  const [alpha, done] = useTweens(getTweens(visible, previouslyVisibleRef.current), [visible]);

  useEffect(() => {
    if (!done) {
      return;
    }
    if (visible) {
      setVisible(text === currentTextRef.current);
    } else {
      currentTextRef.current = text;
      setVisible(text !== null);
    }
    previouslyVisibleRef.current = visible;
  }, [done, text]);

  return currentTextRef.current !== null ? (
    <PlainText {...props} text={currentTextRef.current} alpha={alpha} />
  ) : null;
}

function getTweens(visible: boolean, previouslyVisible: boolean): Tweens {
  if (visible === previouslyVisible) {
    return [{ to: visible ? 1 : 0 }];
  }
  const tweenDurationMs = 250;
  if (visible) {
    return [
      {
        to: 1,
        easing: inQuad,
        durationMs: tweenDurationMs,
      },
    ];
  }
  return [
    { to: 1 },
    {
      to: 0,
      easing: outQuad,
      durationMs: tweenDurationMs,
    },
  ];
}

export default memo(FadeTransitionText);
