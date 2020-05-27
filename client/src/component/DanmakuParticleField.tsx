import { ParticleContainer, Sprite } from '@inlet/react-pixi';
import { Graphics } from '@pixi/graphics';
import times from 'lodash/times';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { center } from '../data/anchors';
import { toRgbNumber, white } from '../data/color';
import { lerp } from '../data/interpolation';
import { focalLength, getPerspective } from '../data/perspective';
import { map, Point } from '../data/point';
import { Tweens } from '../data/tween';
import useTexture from '../hook/useTexture';
import useTweens from '../hook/useTweens';
import { memo } from '../shim/react';
import { useSelector } from '../shim/redux';
import { inOutCubic, linear } from '../shim/tsEasing';

interface Props {
  readonly observerZ: number;
}

function DanmakuParticleField({ observerZ }: Props) {
  const containerSize = useSelector((state) => state.containerSize);
  const particlesRef = useRef<readonly XYZ[]>([]);
  const particleTexture = useTexture(drawParticle);
  const [particleZOffset] = useTweens(particleZOffsetTweens, []);
  const [observerZOffset] = useTweens(
    [
      {
        to: observerZ,
        easing: inOutCubic,
        durationMs: 3500,
      },
    ],
    [observerZ]
  );

  useEffect(() => {
    particlesRef.current = times(particleCount, () => generateRandomCoordinate(containerSize));
  }, [containerSize]);

  return (
    <ParticleContainer
      {...map(containerSize, (x) => x / 2)}
      maxSize={particleCount}
      batchSize={particleCount}
    >
      {particlesRef.current.map(({ x, y, z }, index) => {
        const currentZ = z + particleZOffset - observerZOffset;
        const wrappedZ = currentZ > particleMaxZ ? currentZ % particleMaxZ : currentZ;
        const perspective = getPerspective(wrappedZ);
        const magicalPerspective = perspective ** 2;
        return (
          <Sprite
            key={index}
            texture={particleTexture}
            x={x * magicalPerspective}
            y={y * magicalPerspective}
            anchor={center}
            scale={perspective}
          />
        );
      })}
    </ParticleContainer>
  );
}

const particleMaxZ = 50;
const particleSize = 4;
const particleCount = 120;
const particleDeltaZPerMs = 0.015;
const maxTweenDurationMs = Number.MAX_SAFE_INTEGER;
const particleZOffsetTweens: Tweens = [
  { to: -particleMaxZ * 1.8 },
  {
    to: maxTweenDurationMs * particleDeltaZPerMs,
    easing: linear,
    durationMs: maxTweenDurationMs,
  },
];

function generateRandomCoordinate({ x: width, y: height }: Point): XYZ {
  return {
    x: lerp(-width * 2, width * 2, Math.random()),
    y: lerp(-height * 2, height * 2, Math.random()),
    z: lerp(-0.2 * particleMaxZ, particleMaxZ, Math.random()) - focalLength,
  };
}

interface XYZ {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

function drawParticle(graphics: Graphics) {
  graphics
    .beginFill(toRgbNumber(white))
    .drawRoundedRect(0, 0, particleSize, particleSize, particleSize / 3)
    .endFill();
}

export default memo(DanmakuParticleField);
