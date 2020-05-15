import { AnimatedSprite } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useMemo } from 'react';
import { black, Color, toRgbNumber, white } from '../data/color';
import useTexture from '../hook/useTexture';
import wrapDrawWithShadow from '../shim/pixi/wrapDrawWithShadow';
import { PointLike } from '../shim/reactPixi';
import { useSelector } from '../shim/redux';

function TinyTelevision() {
  const firstTexture = useTexture(drawFirstFrame);
  const secondTexture = useTexture(drawSecondFrame);
  const thirdTexture = useTexture(drawThirdFrame);
  const textures = useMemo(() => [firstTexture, secondTexture, thirdTexture], []);
  const playerPosition = useSelector((state) => state.player.position);
  const moving = useSelector(
    ({ movement: { up, down, left, right } }) => up !== down || left !== right
  );
  return (
    <AnimatedSprite
      {...playerPosition}
      anchor={stomach}
      textures={textures}
      isPlaying={moving}
      initialFrame={moving ? 1 : 0}
      animationSpeed={0.17}
    />
  );
}

const stomach: PointLike = [0.5, 0.7];

const drawFirstFrame = wrapDrawWithShadow(
  black,
  white,
  (graphics: PIXI.Graphics, outline: Color, fill: Color) => {
    graphics
      // Background
      .moveTo(2, 66)
      .beginFill(toRgbNumber(fill))
      .drawPolygon([2, 18, 68, 17, 70, 66, 2, 65])
      .endFill()

      // Outer square
      .lineStyle(4, toRgbNumber(outline))
      .moveTo(2, 66)
      .lineTo(2, 18)
      .lineTo(69, 18)
      .moveTo(68, 17)
      .lineTo(70, 68)
      .moveTo(70, 65)
      .lineTo(1, 65)

      // Inner square
      .moveTo(9, 26)
      .lineTo(63, 27)
      .moveTo(62, 26)
      .lineTo(62, 58)
      .moveTo(61, 58)
      .lineTo(10, 56)
      .moveTo(12, 59)
      .lineTo(10, 25)

      // Antennas
      .moveTo(31, 18)
      .lineTo(15, 7)
      .moveTo(42, 18)
      .lineTo(55, 0)

      // Eyes
      .moveTo(27, 35)
      .lineTo(16, 41)
      .moveTo(42, 34)
      .lineTo(54, 42)

      // Mouth
      .moveTo(25, 43)
      .bezierCurveTo(30, 54, 36, 45, 36, 45)
      .bezierCurveTo(42, 57, 47, 45, 47, 45)

      // Left feet
      .moveTo(14, 66)
      .lineTo(14, 70)
      .moveTo(21, 67)
      .bezierCurveTo(22, 70, 17, 70, 16, 70)

      // Right feet
      .moveTo(51, 67)
      .bezierCurveTo(52, 70, 56, 71, 56, 71)
      .moveTo(58, 66)
      .lineTo(57, 70);
  }
);

const drawSecondFrame = wrapDrawWithShadow(
  black,
  white,
  (graphics: PIXI.Graphics, outline: Color, fill: Color) => {
    graphics
      // Background
      .moveTo(4, 65)
      .beginFill(toRgbNumber(fill))
      .drawPolygon([2, 18, 68, 19, 70, 66, 4, 64])
      .endFill()

      // Outer square
      .lineStyle(4, toRgbNumber(outline))
      .moveTo(4, 65)
      .lineTo(2, 19)
      .moveTo(2, 18)
      .lineTo(68, 19)
      .lineTo(70, 67)
      .moveTo(70, 66)
      .lineTo(2, 64)

      // Inner square
      .moveTo(11, 25)
      .lineTo(62, 26)
      .moveTo(62, 26)
      .lineTo(62, 57)
      .lineTo(11, 57)
      .lineTo(10, 56)
      .lineTo(10, 26)

      // Antennas
      .moveTo(28, 17)
      .lineTo(14, 6)
      .moveTo(42, 17)
      .lineTo(55, 1)

      // Eyes
      .moveTo(28, 35)
      .lineTo(18, 40)
      .moveTo(42, 33)
      .lineTo(54, 40)

      // Mouth
      .moveTo(28, 43)
      .bezierCurveTo(26, 57, 36, 45, 36, 45)
      .bezierCurveTo(44, 57, 45, 46, 45, 46)

      // Left feet
      .moveTo(14, 64)
      .lineTo(14, 69)
      .moveTo(21, 65)
      .bezierCurveTo(23, 70, 21, 70, 15, 71)

      // Right feet
      .moveTo(51, 67)
      .bezierCurveTo(51, 71, 50, 72, 56, 73)
      .moveTo(58, 66)
      .lineTo(56, 71);
  }
);

const drawThirdFrame = wrapDrawWithShadow(
  black,
  white,
  (graphics: PIXI.Graphics, outline: Color, fill: Color) => {
    graphics
      // Background
      .moveTo(4, 65)
      .beginFill(toRgbNumber(fill))
      .drawPolygon([2, 19, 68, 18, 68, 64, 4, 64])
      .endFill()

      // Outer square
      .lineStyle(4, toRgbNumber(outline))
      .moveTo(4, 65)
      .lineTo(2, 19)
      .lineTo(68, 18)
      .lineTo(68, 66)
      .moveTo(68, 64)
      .lineTo(3, 64)

      // Inner square
      .moveTo(11, 26)
      .lineTo(61, 26)
      .lineTo(61, 57)
      .lineTo(11, 57)
      .lineTo(11, 30)

      // Antennas
      .moveTo(29, 18)
      .lineTo(14, 5)
      .moveTo(42, 17)
      .lineTo(53, 0)

      // Eyes
      .moveTo(27, 34)
      .lineTo(18, 40)
      .moveTo(41, 32)
      .lineTo(54, 41)

      // Mouth
      .moveTo(27, 44)
      .bezierCurveTo(26, 55, 36, 42, 36, 42)
      .bezierCurveTo(42, 56, 43, 44, 43, 44)

      // Left feet
      .moveTo(13, 64)
      .lineTo(14, 70)
      .moveTo(21, 65)
      .bezierCurveTo(21, 69, 16, 71, 16, 71)

      // Right feet
      .moveTo(49, 67)
      .lineTo(50, 70)
      .moveTo(57, 66)
      .bezierCurveTo(56, 70, 52, 71, 52, 71);
  }
);

export default TinyTelevision;
