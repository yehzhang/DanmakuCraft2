import Colors from '../Colors';
import Graphics from './Graphics';
import InjectableGraphics from './InjectableGraphics';
import Point from '../../util/syntax/Point';
import {asSequence} from 'sequency';
import {Phaser, PIXI} from '../../util/alias/phaser';

export type Drawer = (graphics: Graphics) => void;

export type InjectedDrawer = (graphics: InjectableGraphics) => void;

/**
 * Base class for builders that draw sprites for entities.
 *
 * @template I type of indices to frames of the sprite built.
 */
abstract class GraphicsBuilder<I extends number | string> {
  constructor(
      private game: Phaser.Game,
      private idGenerator: Phaser.RandomDataGenerator,
      protected drawers: InjectedDrawer[] = []) {
  }

  pushFrame(index: I) {
    let drawer = this.getDrawer(index);
    this.drawers.push(drawer);

    return this;
  }

  /**
   * Attach shadow to last drawer.
   */
  // TODO shadow should be no darker than the background
  withShadow(offset: Point = Point.of(2, 2), color: number = Colors.GREY_NUMBER): this {
    this.decorateLastDrawer(drawer => graphics => {
      graphics.addOffsetBy(offset.x, offset.y);
      graphics.fixFillColor(color).fixLineColor(color);
      drawer(graphics);
      graphics.addOffsetBy(-offset.x, -offset.y);
      graphics.clearFillColor().clearLineColor();

      drawer(graphics);
    });
    return this;
  }

  withScale(scale: number): this {
    this.decorateLastDrawer(drawer => graphics => {
      graphics.multiplyScaleBy(scale);
      drawer(graphics);
      graphics.multiplyScaleBy(1 / scale);
    });
    return this;
  }

  /**
   * @return a key to generated sprite sheet.
   */
  toSpriteSheet(): string {
    let graphics = this.createInjectableGraphics();
    let frameWidth = this.drawSpriteSheetMaxRect(graphics);
    let texture = graphics.generateTexture();
    return this.addTextureToCache(texture, frameWidth);
  }

  toGraphics(): Phaser.Graphics {
    let graphics = this.createInjectableGraphics();
    this.drawSpriteSheetMaxRect(graphics);
    return graphics.getGraphics();
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

  private addTextureToCache(texture: PIXI.Texture, frameWidth: number) {
    let spriteSheetKey = this.idGenerator.uuid();
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
    let frameWidth = asSequence(this.drawers)
        .map(drawer => {
          let testingGraphics = this.createInjectableGraphics();
          drawer(testingGraphics);

          return testingGraphics.getLocalBounds().width;
        })
        .max();

    if (frameWidth == null) {
      throw new TypeError('No drawers were provided');
    }

    for (let drawer of this.drawers) {
      drawer(graphics);
      graphics.addOffsetBy(frameWidth, 0);
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

  private createInjectableGraphics() {
    return new InjectableGraphics(this.game.make.graphics());
  }
}

export default GraphicsBuilder;
