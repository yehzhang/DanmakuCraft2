import Colors from '../Colors';
import Graphics from './Graphics';
import GraphicsBuilder, {Drawer} from './GraphicsBuilder';

class SpeechBubbleBuilder extends GraphicsBuilder<number> {
  protected getDrawer(index: number): Drawer {
    if (index === 0) {
      return draw;
    }
    throw new TypeError(`Unknown frame ${index}`);
  }
}

function draw(graphics: Graphics) {
  graphics
      .moveTo(8, 8)
      .lineStyle(4, Colors.BLACK_NUMBER, 1)
      .beginFill(Colors.WHITE_NUMBER)
      .lineTo(86, 2)
      .curveTo(99, 2, 97, 14)
      .lineTo(90, 65)
      .curveTo(89, 75, 79, 74)
      .lineTo(51, 74)
      .lineTo(29, 90)
      .lineTo(33, 74)
      .lineTo(14, 74)
      .curveTo(7, 74, 6, 65)
      .lineTo(2, 16)
      .curveTo(1, 9, 8, 8)
      .endFill();
}

export default SpeechBubbleBuilder;
