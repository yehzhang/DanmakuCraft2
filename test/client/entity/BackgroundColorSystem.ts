import {expect} from 'chai';
import {ColorMixer, HSL} from '../../../client/src/entitySystem/system/visibility/BackgroundColorSystem';
import Colors from '../../../client/src/render/Colors';
import {Phaser} from '../../../client/src/util/alias/phaser';

describe('ColorMixer', () => {
  let colorMixer: ColorMixer;

  const MAX_MIXED_SATURATION = 0.5;
  const COUNT_BRIGHT_COLORS_TO_REACH_MAX_LIGHTNESS = 5;
  const COLORS_COUNT_TO_REACH_MAX_SATURATION = 20;
  const COLORS_COUNT_TO_REACH_MAX_LIGHTNESS = 100;

  beforeEach(() => {
    colorMixer = new ColorMixer(
        MAX_MIXED_SATURATION,
        COUNT_BRIGHT_COLORS_TO_REACH_MAX_LIGHTNESS,
        COLORS_COUNT_TO_REACH_MAX_SATURATION,
        COLORS_COUNT_TO_REACH_MAX_LIGHTNESS);
  });

  function expectHsl(h: number, s: number, l: number) {
    const hsl = colorMixer.getMixedColor();
    try {
      expect(hsl.h).to.be.closeTo(h, 1e-6);
      expect(hsl.s).to.be.closeTo(s, 1e-6);
      expect(hsl.l).to.be.closeTo(l, 1e-6);
    } catch {
      expect(new HSL(hsl.h, hsl.s, hsl.l)).to.deep.equal(new HSL(h, s, l));
    }
  }

  function toLightness(colorsCount: number): number {
    return Phaser.Easing.Cubic.Out(colorsCount / COLORS_COUNT_TO_REACH_MAX_LIGHTNESS);
  }

  describe('should produce a color correctly', () => {
    it('when there are no colors.', () => {
      expectHsl(0, 0, toLightness(1));
    });

    it('when there is one white color.', () => {
      colorMixer.add(Colors.WHITE_NUMBER, false);
      expectHsl(0, 0, toLightness(2));
    });

    it('when there are two white colors.', () => {
      colorMixer.add(Colors.WHITE_NUMBER, false);
      colorMixer.add(Colors.WHITE_NUMBER, false);

      expectHsl(0, 0, toLightness(3));
    });

    it('when there is one black color.', () => {
      colorMixer.add(Colors.BLACK_NUMBER, false);
      expectHsl(0, 0, toLightness(2));
    });

    it('when there are two black colors.', () => {
      colorMixer.add(Colors.BLACK_NUMBER, false);
      colorMixer.add(Colors.BLACK_NUMBER, false);

      expectHsl(0, 0, toLightness(3));
    });

    it('when there is one red color.', () => {
      colorMixer.add(Colors.RED_NUMBER, false);
      expectHsl(0, 1 / COLORS_COUNT_TO_REACH_MAX_SATURATION, toLightness(2));
    });

    it('when there is one green color.', () => {
      colorMixer.add(Colors.GREEN_NUMBER, false);
      expectHsl(1 / 3, 1 / COLORS_COUNT_TO_REACH_MAX_SATURATION, toLightness(2));
    });

    it('when there is one white color and one black color.', () => {
      colorMixer.add(Colors.WHITE_NUMBER, false);
      colorMixer.add(Colors.BLACK_NUMBER, false);

      expectHsl(0, 0, toLightness(3));
    });

    it('when there is one green color and one black color.', () => {
      colorMixer.add(Colors.GREEN_NUMBER, false);
      colorMixer.add(Colors.BLACK_NUMBER, false);

      expectHsl(1 / 3, 1 / COLORS_COUNT_TO_REACH_MAX_SATURATION, toLightness(3));
    });

    it('when there is one green color and two black colors.', () => {
      colorMixer.add(Colors.GREEN_NUMBER, false);
      colorMixer.add(Colors.BLACK_NUMBER, false);
      colorMixer.add(Colors.BLACK_NUMBER, false);

      expectHsl(1 / 3, 1 / COLORS_COUNT_TO_REACH_MAX_SATURATION, toLightness(4));
    });

    it('when there are two green colors and one black color.', () => {
      colorMixer.add(Colors.GREEN_NUMBER, false);
      colorMixer.add(Colors.GREEN_NUMBER, false);
      colorMixer.add(Colors.BLACK_NUMBER, false);

      expectHsl(1 / 3, 2 / COLORS_COUNT_TO_REACH_MAX_SATURATION, toLightness(4));
    });

    it('when there are ninety-nine colors.', () => {
      for (let i = 0; i < COLORS_COUNT_TO_REACH_MAX_LIGHTNESS - 2; i++) {
        colorMixer.add(Colors.BLACK_NUMBER, false);
      }
      expectHsl(0, 0, toLightness(COLORS_COUNT_TO_REACH_MAX_LIGHTNESS - 1));
    });

    it('when there are ninety-nine colors.', () => {
      for (let i = 0; i < 99; i++) {
        colorMixer.add(Colors.BLACK_NUMBER, false);
      }
      expectHsl(0, 0, 1);
    });
  });
});

// describe('BackgroundColorSystem', () => {
//   const system: BackgroundColorSystem;
//   const mockGame: Phaser.Game;
//
//   beforeEach(() => {
//     mockGame = mock(Phaser.Game);
//     system = new BackgroundColorSystem(mockGame);
//   });
//
//
// });
