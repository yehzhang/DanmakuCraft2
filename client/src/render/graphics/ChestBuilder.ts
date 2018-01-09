import GraphicsBuilder from './GraphicsBuilder';
import Graphics from './Graphics';
import Colors from '../Colors';

class ChestBuilder extends GraphicsBuilder<number> {
  static drawLockedChest(graphics: Graphics) {
    // 73 x 45
    // Top
    graphics
        .beginFill(Colors.WHITE_NUMBER)
        .lineStyle(3, Colors.BLACK_NUMBER, 1)
        .drawRoundedRect(0, 0, 73, 25, 10)
        .endFill()

        // Bottom Background
        .lineStyle(0)
        .beginFill(Colors.WHITE_NUMBER)
        .drawRect(0, 17, 73, 28)
        .endFill()

        // Bottom Silhouette
        .lineStyle(3, Colors.BLACK_NUMBER, 1)
        .moveTo(0, 17)
        .lineTo(0, 45)
        .lineTo(73, 45)
        .lineTo(73, 17)

        // Crack
        .lineStyle(2, Colors.BLACK_NUMBER, 1)
        .moveTo(-1, 17)
        .lineTo(75, 17)

        // Lock
        .lineStyle(2, Colors.BLACK_NUMBER, 1)
        .beginFill(Colors.WHITE_NUMBER)
        .drawRect(33, 13, 7, 12)
        .endFill();
  }

  static drawOpenedChest(graphics: Graphics) {
    // Bottom Background
    graphics
        .lineStyle(0)
        .beginFill(Colors.WHITE_NUMBER)
        .drawRect(0, 17, 73, 28)
        .endFill()

        // Bottom Silhouette
        .lineStyle(3, Colors.BLACK_NUMBER, 1)
        .moveTo(0, 17)
        .lineTo(0, 45)
        .lineTo(73, 45)
        .lineTo(73, 17)

        // Crack
        .lineStyle(2, Colors.BLACK_NUMBER, 1)
        .moveTo(-1, 17)
        .lineTo(75, 17)

        // Lock
        .lineStyle(2, Colors.BLACK_NUMBER, 1)
        .drawRect(33, 17, 7, 5);
  }

  protected getDrawer(index: number) {
    switch (index) {
      case 0:
        return ChestBuilder.drawLockedChest;
      case 1:
        return ChestBuilder.drawOpenedChest;
      default:
        throw new TypeError(`Tiny television does not have frame '${index}'`);
    }
  }
}

export default ChestBuilder;
