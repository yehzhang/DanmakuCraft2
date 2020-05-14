import * as PIXI from 'pixi.js';
import { Color, grey } from '../../data/color';

function wrapDrawWithShadow(outline: Color, fill: Color, draw: DrawWithColor): Draw {
  return (graphics: PIXI.Graphics) => {
    drawWithShadow(graphics, outline, fill, draw);
  };
}

type DrawWithColor = (graphics: PIXI.Graphics, outline: Color, fill: Color) => void;

function drawWithShadow(
  container: PIXI.Container,
  outline: Color,
  fill: Color,
  draw: DrawWithColor
) {
  // Draw shadow
  const shadowGraphics = new PIXI.Graphics();
  const shadowOffset = new PIXI.Matrix().translate(2, 2);
  shadowGraphics.setMatrix(shadowOffset);
  draw(shadowGraphics, grey, grey);

  // Draw outline
  const outlineGraphics = new PIXI.Graphics();
  draw(outlineGraphics, outline, fill);

  container.addChild(shadowGraphics);
  container.addChild(outlineGraphics);
}

type Draw = (graphics: PIXI.Graphics) => void;

export default wrapDrawWithShadow;
