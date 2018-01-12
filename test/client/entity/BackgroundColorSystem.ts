import {expect} from 'chai';
import {ColorMixer} from '../../../client/src/entitySystem/system/existence/BackgroundColorSystem';
import Colors from '../../../client/src/render/Colors';
import {Phaser} from '../../../client/src/util/alias/phaser';

describe('ColorMixer', () => {
  let colorMixer: ColorMixer;

  beforeEach(() => {
    colorMixer = new ColorMixer(0.5, 20, 1, 100);
  });

  function expectHsl(h: number, s: number, l: number) {
    let hsl = colorMixer.getMixedColor();
    try {
      expect(hsl.h).to.be.closeTo(h, 1e-6);
      expect(hsl.s).to.be.closeTo(s, 1e-6);
      expect(hsl.l).to.be.closeTo(l, 1e-6);
    } catch {
      expect(createHsl(hsl.h, hsl.s, hsl.l)).to.deep.equal(createHsl(h, s, l));
    }
  }

  function createHsl(h: number, s: number, l: number) {
    return {h, s, l};
  }

  describe('should produce a color correctly', () => {
    it('when there are no colors.', () => {
      expectHsl(0, 0, Phaser.Easing.Quadratic.Out(1 / 100));
    });

    it('when there is one white color.', () => {
      colorMixer.add(Colors.WHITE_NUMBER);
      expectHsl(0, 0, Phaser.Easing.Quadratic.Out(2 / 100));
    });

    it('when there are two white colors.', () => {
      colorMixer.add(Colors.WHITE_NUMBER);
      colorMixer.add(Colors.WHITE_NUMBER);

      expectHsl(0, 0, Phaser.Easing.Quadratic.Out(3 / 100));
    });

    it('when there is one black color.', () => {
      colorMixer.add(Colors.BLACK_NUMBER);
      expectHsl(0, 0, Phaser.Easing.Quadratic.Out(2 / 100));
    });

    it('when there are two black colors.', () => {
      colorMixer.add(Colors.BLACK_NUMBER);
      colorMixer.add(Colors.BLACK_NUMBER);

      expectHsl(0, 0, Phaser.Easing.Quadratic.Out(3 / 100));
    });

    it('when there is one red color.', () => {
      colorMixer.add(Colors.RED_NUMBER);

      expectHsl(0, 1 / 20, Phaser.Easing.Quadratic.Out(2 / 100));
    });

    it('when there is one green color.', () => {
      colorMixer.add(Colors.GREEN_NUMBER);

      expectHsl(1 / 3, 1 / 20, Phaser.Easing.Quadratic.Out(2 / 100));
    });

    it('when there is one white color and one black color.', () => {
      colorMixer.add(Colors.WHITE_NUMBER);
      colorMixer.add(Colors.BLACK_NUMBER);

      expectHsl(0, 0, Phaser.Easing.Quadratic.Out(3 / 100));
    });

    it('when there is one green color and one black color.', () => {
      colorMixer.add(Colors.GREEN_NUMBER);
      colorMixer.add(Colors.BLACK_NUMBER);

      expectHsl(1 / 3, 1 / 20, Phaser.Easing.Quadratic.Out(3 / 100));
    });

    it('when there is one green color and two black colors.', () => {
      colorMixer.add(Colors.GREEN_NUMBER);
      colorMixer.add(Colors.BLACK_NUMBER);
      colorMixer.add(Colors.BLACK_NUMBER);

      expectHsl(1 / 3, 1 / 20, Phaser.Easing.Quadratic.Out(4 / 100));
    });

    it('when there are two green colors and one black color.', () => {
      colorMixer.add(Colors.GREEN_NUMBER);
      colorMixer.add(Colors.GREEN_NUMBER);
      colorMixer.add(Colors.BLACK_NUMBER);

      expectHsl(1 / 3, 2 / 20, Phaser.Easing.Quadratic.Out(4 / 100));
    });

    it('when there are ninety-nine colors.', () => {
      for (let i = 0; i < 98; i++) {
        colorMixer.add(Colors.BLACK_NUMBER);
      }
      expectHsl(0, 0, Phaser.Easing.Quadratic.Out(99 / 100));
    });

    it('when there are ninety-nine colors.', () => {
      for (let i = 0; i < 99; i++) {
        colorMixer.add(Colors.BLACK_NUMBER);
      }
      expectHsl(0, 0, 1);
    });
  });
});

// describe('BackgroundColorSystem', () => {
//   let system: BackgroundColorSystem;
//   let mockGame: Phaser.Game;
//
//   beforeEach(() => {
//     mockGame = mock(Phaser.Game);
//     system = new BackgroundColorSystem(mockGame);
//   });
//
//
// });
