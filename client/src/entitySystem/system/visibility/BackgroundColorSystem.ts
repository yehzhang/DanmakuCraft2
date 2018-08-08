import {Bag} from 'typescript-collections';
import PhysicalConstants from '../../../PhysicalConstants';
import Colors from '../../../render/Colors';
import {Phaser} from '../../../util/alias/phaser';
import Container from '../../../util/dataStructures/Container';
import Polar from '../../../util/math/Polar';
import Point from '../../../util/syntax/Point';
import {CommentEntity} from '../../alias';
import Entity from '../../Entity';
import VisibilitySystem from './VisibilitySystem';

class BackgroundColorSystem implements VisibilitySystem<CommentEntity> {
  private static readonly MAX_RGB_VALUE = 255;
  private readonly baseColor: Phaser.RGBColor;

  constructor(
      private readonly game: Phaser.Game,
      private readonly currentSpawnPoints: Container<Entity>,
      private readonly maxTransitionDuration: number = 6 * Phaser.Timer.SECOND,
      private readonly colorMixer: ColorMixer = new ColorMixer(),
      baseColor: number = Colors.BACKGROUND_NUMBER,
      private colorTween: Phaser.Tween | null = null) {
    this.baseColor = Phaser.Color.getRGB(baseColor);
  }

  enter(comment: CommentEntity) {
    this.colorMixer.add(comment.color, comment.isRegisteredAfterGenesis());
  }

  update(comment: CommentEntity) {
  }

  exit(comment: CommentEntity) {
    this.colorMixer.remove(comment.color, comment.isRegisteredAfterGenesis());
  }

  finish() {
    if (this.colorTween) {
      this.colorTween.stop();
    }

    const color = this.getBackgroundColor();
    this.colorTween = this.buildBackgroundColorTween(color);
    this.colorTween.start();
  }

  private getBackgroundColor() {
    if (this.currentSpawnPoints.count() > 0) {
      return Colors.BACKGROUND_NUMBER;
    }

    const hsl = this.colorMixer.getMixedColor();
    const colorMask = Phaser.Color.HSLtoRGB(hsl.h, hsl.s, hsl.l);
    return blendColors(colorMask, this.baseColor);
  }

  private buildBackgroundColorTween(targetColor: number): Phaser.Tween {
    // Tweens the color in RGB.
    const currentColorObj = Phaser.Color.getRGB(this.game.stage.backgroundColor);
    const targetColorObj = Phaser.Color.getRGB(targetColor);
    const transitionDuration = this.getTransitionDuration(currentColorObj, targetColorObj);
    const colorTween = this.game.add.tween(currentColorObj).to(targetColorObj, transitionDuration);

    colorTween.onUpdateCallback(() => {
      this.game.stage.backgroundColor =
          Phaser.Color.getColor(currentColorObj.r, currentColorObj.g, currentColorObj.b);
    });

    return colorTween;
  }

  private getTransitionDuration(
      currentColorObj: Phaser.RGBColor,
      targetColorObj: Phaser.RGBColor) {
    const maxColorDistance = Math.max(
        Math.abs(currentColorObj.r - targetColorObj.r),
        Math.abs(currentColorObj.g - targetColorObj.g),
        Math.abs(currentColorObj.b - targetColorObj.b));
    const transitionDurationPercent =
        Phaser.Math.percent(maxColorDistance, BackgroundColorSystem.MAX_RGB_VALUE);
    return this.maxTransitionDuration * transitionDurationPercent;
  }
}

/**
 * Produces a color between black and white based on mixed colors.
 */
export class ColorMixer {
  constructor(
      private readonly maxMixedSaturation: number = 0.5,
      private readonly countBrightColorsToReachMaxLightness: number = 7,
      private readonly colorsCountToReachMaxSaturation: number =
          PhysicalConstants.BACKGROUND_COLORS_COUNT_TO_REACH_MAX_SATURATION,
      private readonly colorsCountToReachMaxLightness: number =
          PhysicalConstants.BACKGROUND_COLORS_COUNT_TO_REACH_MAX_LIGHTNESS,
      private lightnessCounter: number = 0,
      private readonly rgbsCounter: Bag<number> = new Bag()) {
  }

  add(rgb: number, isBright: boolean) {
    this.rgbsCounter.add(rgb);
    this.lightnessCounter =
        Math.max(this.lightnessCounter + this.getEffectiveLightnessWeight(isBright), 0);
  }

  remove(rgb: number, isBright: boolean) {
    this.rgbsCounter.remove(rgb);
    this.lightnessCounter =
        Math.max(this.lightnessCounter - this.getEffectiveLightnessWeight(isBright), 0);
  }

  getMixedColor(): HSL {
    const [hue, saturation] = this.getHueAndSaturation();
    const lightness = this.getLightness();
    return new HSL(hue, saturation, lightness);
  }

  private getEffectiveLightnessWeight(isBright: boolean) {
    if (isBright) {
      return this.colorsCountToReachMaxLightness / this.countBrightColorsToReachMaxLightness;
    }
    return 1;
  }

  private getHueAndSaturation() {
    const mixingRgbs = this.rgbsCounter.toSet().toArray();
    const hueCoordinates = Point.origin();
    const tempHueCoordinates = Point.origin();
    for (const rgb of mixingRgbs) {
      const rgbObject = Phaser.Color.getRGB(rgb);
      const hslObject = Phaser.Color.RGBtoHSL(rgbObject.r, rgbObject.g, rgbObject.b);
      tempHueCoordinates.setToPolar(hslObject.h * Phaser.Math.PI2, hslObject.s);

      const colorCount = this.rgbsCounter.count(rgb);
      tempHueCoordinates.multiply(colorCount, colorCount);

      hueCoordinates.add(tempHueCoordinates.x, tempHueCoordinates.y);
    }

    const colorsCount = mixingRgbs.map(color => this.rgbsCounter.count(color))
        .reduce((colorCount, other) => colorCount + other, 0);
    if (colorsCount > 0) {
      hueCoordinates.divide(colorsCount, colorsCount);
    }

    const [azimuth, radius] = Polar.from(hueCoordinates);
    const colorsPercentForSaturation =
        Phaser.Math.percent(colorsCount, this.colorsCountToReachMaxSaturation);
    const saturation = Math.min(radius * colorsPercentForSaturation, this.maxMixedSaturation);

    const hue = azimuth / Phaser.Math.PI2;

    return [hue, saturation];
  }

  private getLightness() {
    const lightness = Phaser.Math.percent(
        this.lightnessCounter + this.colorsCountToReachMaxLightness * 0.01,
        Math.max(this.colorsCountToReachMaxLightness, 1));
    // Makes it as dark as possible, so that the effect of a newly-sent comment is salient.
    return Phaser.Easing.Cubic.Out(lightness);
  }
}

function blendColors(rgb: Phaser.RGBColor, other: Phaser.RGBColor): number {
  return Phaser.Color.getColor(
      Phaser.Color.blendMultiply(rgb.r, other.r),
      Phaser.Color.blendMultiply(rgb.g, other.g),
      Phaser.Color.blendMultiply(rgb.b, other.b));
}

export class HSL {
  constructor(public h: number, public s: number, public l: number) {
  }
}

export default BackgroundColorSystem;
