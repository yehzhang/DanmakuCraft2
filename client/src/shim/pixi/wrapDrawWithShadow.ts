import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Matrix } from '@pixi/math';
import { Color, grey } from '../../data/color';

function wrapDrawWithShadow(outline: Color, fill: Color, draw: DrawWithColor): Draw {
  return (graphics: Graphics) => {
    drawWithShadow(graphics, outline, fill, draw);
  };
}

type DrawWithColor = (graphics: Graphics, outline: Color, fill: Color) => void;

function drawWithShadow(container: Container, outline: Color, fill: Color, draw: DrawWithColor) {
  // Draw shadow
  const shadowGraphics = new Graphics();
  const shadowOffset = new Matrix().translate(2, 2);
  shadowGraphics.setMatrix(shadowOffset);
  draw(shadowGraphics, grey, grey);

  // Draw outline
  const outlineGraphics = new Graphics();
  draw(outlineGraphics, outline, fill);

  container.addChild(shadowGraphics);
  container.addChild(outlineGraphics);
}

type Draw = (graphics: Graphics) => void;

export default wrapDrawWithShadow;
