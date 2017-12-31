import {CommentEntity, Region} from '../../alias';
import BaseExistenceSystem from './BaseExistenceSystem';
import Point from '../../../util/syntax/Point';
import Colors from '../../../render/Colors';
import PhysicalConstants from '../../../PhysicalConstants';
import {Bag} from 'typescript-collections';

class BackgroundColorSystem extends BaseExistenceSystem<Region<CommentEntity>> {
  private baseColor: Phaser.RGBColor;

  constructor(
      private game: Phaser.Game,
      private transitionDuration: number = PhysicalConstants.BACKGROUND_TRANSITION_DURATION_MS,
      private colorMixer: ColorMixer = new ColorMixer(),
      baseColor: number = Colors.BACKGROUND_NUMBER,
      private colorTween: Phaser.Tween | null = null) {
    super();
    this.baseColor = Phaser.Color.getRGB(baseColor);
  }

  private static blendColors(rgb: Phaser.RGBColor, other: Phaser.RGBColor): number {
    let r = Phaser.Color.blendMultiply(rgb.r, other.r);
    let g = Phaser.Color.blendMultiply(rgb.g, other.g);
    let b = Phaser.Color.blendMultiply(rgb.b, other.b);

    return Phaser.Color.getColor(r, g, b);
  }

  enter(region: Region<CommentEntity>) {
    // TODO enforce lightning of spawn points
    for (let entity of region.container) {
      this.colorMixer.add(entity.color);
    }
  }

  exit(region: Region<CommentEntity>) {
    for (let entity of region.container) {
      this.colorMixer.remove(entity.color);
    }
  }

  finish() {
    if (this.colorTween) {
      this.colorTween.stop();
    }

    let hsl = this.colorMixer.getMixedColor();
    let colorMask = Phaser.Color.HSLtoRGB(hsl.h, hsl.s, hsl.l);
    let color = BackgroundColorSystem.blendColors(colorMask, this.baseColor);

    this.colorTween = this.buildBackgroundColorTween(color);
    this.colorTween.start();
  }

  private buildBackgroundColorTween(targetColor: number): Phaser.Tween {
    // Tweens the color in RGB.
    let currColorObj = Phaser.Color.getRGB(this.game.stage.backgroundColor);
    let targetColorObj = Phaser.Color.getRGB(targetColor);
    let colorTween = this.game.add.tween(currColorObj).to(targetColorObj, this.transitionDuration);

    colorTween.onUpdateCallback(() => {
      this.game.stage.backgroundColor =
          Phaser.Color.getColor(currColorObj.r, currColorObj.g, currColorObj.b);
    });

    return colorTween;
  }
}

export default BackgroundColorSystem;

/**
 * Produces a color between black and white based on mixed colors.
 */
export class ColorMixer {
  constructor(
      private maxMixedSaturation = 0.5,
      private colorsCountToReachMaxSaturation = PhysicalConstants.BACKGROUND_COLORS_COUNT_TO_REACH_MAX_SATURATION,
      private colorsCountPadding = 1,
      private colorsCountToReachMaxLightness = PhysicalConstants.BACKGROUND_COLORS_COUNT_TO_REACH_MAX_LIGHTNESS,
      private rgbsCounter: Bag<number> = new Bag()) {
  }

  private static getRatio(value: number, max: number) {
    return Math.min(value, max) / max;
  }

  add(rgb: number, nCopies?: number) {
    this.rgbsCounter.add(rgb, nCopies);
  }

  remove(rgb: number, nCopies?: number) {
    this.rgbsCounter.remove(rgb, nCopies);
  }

  getMixedColor(): HSL {
    let mixingRgbs = this.rgbsCounter.toSet().toArray();
    let colorsCount = mixingRgbs.map(color => this.rgbsCounter.count(color))
        .reduce((colorCount, other) => colorCount + other, 0);

    // Set hue and saturation.
    let hueCoordinates = Point.origin();
    let tempHueCoordinates = Point.origin();
    for (let rgb of mixingRgbs) {
      let rgbObject = Phaser.Color.getRGB(rgb);
      let hslObject = Phaser.Color.RGBtoHSL(rgbObject.r, rgbObject.g, rgbObject.b);
      tempHueCoordinates.setToPolar(hslObject.h * Phaser.Math.PI2, hslObject.s);

      let colorCount = this.rgbsCounter.count(rgb);
      tempHueCoordinates.multiply(colorCount, colorCount);

      hueCoordinates.add(tempHueCoordinates.x, tempHueCoordinates.y);
    }
    if (colorsCount > 0) {
      hueCoordinates.divide(colorsCount, colorsCount);
    }

    let radius = hueCoordinates.getMagnitude();
    let colorsRatioForSaturation =
        ColorMixer.getRatio(colorsCount, this.colorsCountToReachMaxSaturation);
    let saturation = Math.min(radius * colorsRatioForSaturation, this.maxMixedSaturation);

    let hue = Phaser.Math.angleBetween(0, 0, hueCoordinates.x, hueCoordinates.y)
        / Phaser.Math.PI2;

    // Set lightness.
    let colorsRatioForLightness = ColorMixer.getRatio(
        colorsCount + this.colorsCountPadding, this.colorsCountToReachMaxLightness);
    let lightness = Phaser.Easing.Exponential.Out(colorsRatioForLightness);

    return new HSL(hue, saturation, lightness);
  }
}

export class HSL {
  constructor(public h: number, public s: number, public l: number) {
  }
}
