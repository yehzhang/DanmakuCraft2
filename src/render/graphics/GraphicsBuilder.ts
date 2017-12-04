import Colors from '../Colors';
import IdGenerator from '../../IdGenerator';
import Graphics, {InjectableGraphics} from './Graphics';

export type Drawer = (graphics: Graphics) => void;

export type InjectedDrawer = (graphics: InjectableGraphics) => void;

/**
 * Base class for builders that draw sprites for entities.
 *
 * @template I type of indices to frames of the sprite built.
 */
export abstract class GraphicsBuilder<I> {
  protected drawers: InjectedDrawer[];
  private initialFrameIndex: I | null;

  constructor(private game: Phaser.Game, private idGenerator: IdGenerator) {
    this.drawers = [];
    this.initialFrameIndex = null;
  }

  pushFrame(index: I) {
    let drawer = this.getDrawer(index);
    this.drawers.push(drawer);

    if (this.initialFrameIndex == null) {
      this.initialFrameIndex = index;
    }

    return this;
  }

  /**
   * Attach shadow to last drawer.
   */
  withShadow(offset?: Phaser.Point, color: number = Colors.GREY_NUMBER): this {
    this.decorateLastDrawer(drawer => graphics => {
      if (offset === undefined) {
        offset = new Phaser.Point(2, 2);
      }
      graphics.addOffsetBy(offset.x, offset.y);
      graphics.fixFillColor(color).fixLineColor(color);
      drawer(graphics);

      graphics.addOffsetBy(-offset.x, -offset.y);
      graphics.clearFillColor().clearLineColor();
      drawer(graphics);
    });
    return this;
  }

  /**
   * @return a key to generated sprite sheet.
   */
  toSpriteSheet(): string {
    let graphics = new InjectableGraphics();
    let frameWidth = this.drawSpriteSheetMaxRect(graphics);
    let texture = graphics.generateTexture();
    return this.addTextureToCache(texture, frameWidth);
  }

  toSprite(): Phaser.Sprite {
    let spriteSheetKey = this.toSpriteSheet();
    return this.game.make.sprite(0, 0, spriteSheetKey, this.initialFrameIndex);
  }

  toGraphics(): PIXI.Graphics {
    throw new Error('Not Implemented');
  }

  protected abstract getDrawer(index: I): Drawer;

  protected decorateLastDrawer(decorator: (drawer: InjectedDrawer) => InjectedDrawer) {
    let drawer = this.drawers.pop();
    if (drawer === undefined) {
      throw new TypeError('No operation precedes this one');
    }

    drawer = decorator(drawer);

    this.drawers.push(drawer);
  }

  private addTextureToCache(texture: PIXI.RenderTexture, frameWidth: number) {
    let spriteSheetKey = this.idGenerator.generateUniqueId();
    this.game.cache.addSpriteSheet(
        spriteSheetKey,
        null,
        texture.baseTexture.source,
        frameWidth,
        texture.height);

    return spriteSheetKey;
  }

  /**
   * @return width of a frame
   */
  private drawSpriteSheetMaxRect(graphics: InjectableGraphics) {
    let frameDimensions = [];
    for (let drawer of this.drawers) {
      let testingGraphics = new InjectableGraphics();

      drawer(testingGraphics);

      let bounds = testingGraphics.getLocalBounds().clone();
      frameDimensions.push(bounds);
    }
    let frameWidth = Math.max(...frameDimensions.map(dimension => dimension.width));

    let frameDimensionsIndex = 0;
    for (let drawer of this.drawers) {
      let frameDimension = frameDimensions[frameDimensionsIndex];
      let leftMargin = frameDimension.x;
      let topMargin = frameDimension.y;
      graphics.addOffsetBy(-leftMargin, -topMargin);
      drawer(graphics);
      graphics.addOffsetBy(leftMargin, topMargin);

      graphics.addOffsetBy(frameWidth, 0);

      frameDimensionsIndex++;
    }

    // Right padding
    graphics
        .lineStyle(0, 0, 0)
        .beginFill(0, 0)
        .drawPolygon([
          -1, 0,
          0, 0,
          0, 1,
          -1, 1])
        .endFill();

    return frameWidth;
  }
}
