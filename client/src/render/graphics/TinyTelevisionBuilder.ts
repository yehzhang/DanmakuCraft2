import GraphicsBuilder from './GraphicsBuilder';
import Colors from '../Colors';
import Graphics from './Graphics';

class TinyTelevisionBuilder extends GraphicsBuilder<number> {
  static drawFirstFrame(graphics: Graphics) {
    // background
    graphics
        .moveTo(2, 66)
        .lineStyle(0, Colors.WHITE_NUMBER, 1)
        .beginFill(Colors.WHITE_NUMBER)
        .drawPolygon([
          2, 18,
          68, 17,
          70, 66,
          2, 65])
        .endFill()

        // outer square
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(2, 66)
        .lineTo(2, 18)
        .lineTo(69, 18)
        .moveTo(68, 17)
        .lineTo(70, 68)
        .moveTo(70, 65)
        .lineTo(1, 65)

        // inner square
        .moveTo(9, 26)
        .lineTo(63, 27)
        .moveTo(62, 26)
        .lineTo(62, 58)
        .moveTo(61, 58)
        .lineTo(10, 56)
        .moveTo(12, 59)
        .lineTo(10, 25)

        // antennas
        .moveTo(31, 18)
        .lineTo(15, 7)
        .moveTo(42, 18)
        .lineTo(55, 0)

        // eyes
        .moveTo(27, 35)
        .lineTo(16, 41)
        .moveTo(42, 34)
        .lineTo(54, 42)

        // mouth
        .moveTo(25, 43)
        .curveTo(30, 54, 36, 45)
        .curveTo(42, 57, 47, 45)

        // left feet
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(14, 66)
        .lineTo(14, 70)
        .moveTo(21, 67)
        .bezierCurveTo(22, 70, 17, 70, 16, 70)

        // right feet
        .moveTo(51, 67)
        .bezierCurveTo(52, 70, 56, 71, 56, 71)
        .moveTo(58, 66)
        .lineTo(57, 70);
  }

  static drawSecondFrame(graphics: Graphics) {
    // background
    graphics
        .lineStyle(0, Colors.WHITE_NUMBER, 0)
        .moveTo(4, 65)
        .beginFill(Colors.WHITE_NUMBER)
        .drawPolygon([
          2, 18,
          68, 19,
          70, 66,
          4, 64])
        .endFill()

        // outer sqaure
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(4, 65)
        .lineTo(2, 19)
        .moveTo(2, 18)
        .lineTo(68, 19)
        .lineTo(70, 67)
        .moveTo(70, 66)
        .lineTo(2, 64)

        // inner sqaure
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(11, 25)
        .lineTo(62, 26)
        .moveTo(62, 26)
        .lineTo(62, 57)
        .lineTo(11, 57)
        .lineTo(10, 56)
        .lineTo(10, 26)

        // antennas
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(28, 17)
        .lineTo(14, 6)
        .moveTo(42, 17)
        .lineTo(55, 1)

        // eyes
        .moveTo(28, 35)
        .lineTo(18, 40)
        .moveTo(42, 33)
        .lineTo(54, 40)

        // mouth
        .moveTo(28, 43)
        .curveTo(26, 57, 36, 45)
        .curveTo(44, 57, 45, 46)

        // left feet
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(14, 64)
        .lineTo(14, 69)
        .moveTo(21, 65)
        .bezierCurveTo(23, 70, 21, 70, 15, 71)

        // right feet
        .moveTo(51, 67)
        .bezierCurveTo(51, 71, 50, 72, 56, 73)
        .moveTo(58, 66)
        .lineTo(56, 71);
  }

  static drawThirdFrame(graphics: Graphics) {
    // background
    graphics
        .lineStyle(0, Colors.WHITE_NUMBER, 0)
        .moveTo(4, 65)
        .beginFill(Colors.WHITE_NUMBER)
        .drawPolygon([
          2, 19,
          68, 18,
          68, 64,
          4, 64])
        .endFill()

        // outer square
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(4, 65)
        .lineTo(2, 19)
        .lineTo(68, 18)
        .lineTo(68, 66)
        .moveTo(68, 64)
        .lineTo(3, 64)

        // inner square
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(11, 26)
        .lineTo(61, 26)
        .lineTo(61, 57)
        .lineTo(11, 57)
        .lineTo(11, 30)

        // antennas
        .moveTo(29, 18)
        .lineTo(14, 5)
        .moveTo(42, 17)
        .lineTo(53, 0)

        // eyes
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(27, 34)
        .lineTo(18, 40)
        .moveTo(41, 32)
        .lineTo(54, 41)

        // mouth
        .moveTo(27, 44)
        .curveTo(26, 55, 36, 42)
        .curveTo(42, 56, 43, 44)

        // left feet
        .lineStyle(4, Colors.BLACK_NUMBER, 1)
        .moveTo(13, 64)
        .lineTo(14, 70)
        .moveTo(21, 65)
        .bezierCurveTo(21, 69, 16, 71, 16, 71)

        // right feet
        .moveTo(49, 67)
        .lineTo(50, 70)
        .moveTo(57, 66)
        .bezierCurveTo(56, 70, 52, 71, 52, 71);
  }

  protected getDrawer(index: number) {
    switch (index) {
      case 0:
        return TinyTelevisionBuilder.drawFirstFrame;
      case 1:
        return TinyTelevisionBuilder.drawSecondFrame;
      case 2:
        return TinyTelevisionBuilder.drawThirdFrame;
      default:
        throw new TypeError(`Tiny television does not have frame '${index}'`);
    }
  }
}

export default TinyTelevisionBuilder;
