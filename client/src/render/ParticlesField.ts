import Perspective from './Perspective';

class ParticlesField {
  private static readonly FOCAL_LENGTH = 10;
  private static readonly MAX_DISTANCE = 50;

  constructor(
      private game: Phaser.Game,
      spriteSheetKey: string,
      readonly particleSpeed: number = 0.2,
      numParticles: number = 100,
      readonly display: Phaser.SpriteBatch = game.make.spriteBatch(),
      private particles: Perspective[] = []) {
    if (particleSpeed <= 0) {
      throw new TypeError('Invalid observer speed');
    }

    for (let i = 0; i < numParticles; i++) {
      let [x, y, z] = ParticlesField.getRandomCoordinates(game.width, game.height);
      let particleDisplay = game.make.sprite(0, 0, spriteSheetKey);
      particleDisplay.position.setTo(x, y);
      particleDisplay.anchor.setTo(0.5);
      let particle = new Perspective(particleDisplay, z, ParticlesField.FOCAL_LENGTH, false, true);

      display.addChild(particleDisplay);

      this.particles.push(particle);
    }
  }

  private static getRandomCoordinates(width: number, height: number) {
    return [
      Phaser.Math.between(-width * 2, width * 2),
      Phaser.Math.between(-height * 2, height * 2),
      Phaser.Math.between(-ParticlesField.MAX_DISTANCE * 5, 0) - ParticlesField.FOCAL_LENGTH];
  }

  update() {
    for (let particle of this.particles) {
      let z = particle.z + this.particleSpeed;
      if (z >= ParticlesField.MAX_DISTANCE) {
        z -= ParticlesField.MAX_DISTANCE;
      }
      particle.z = z;
    }
  }

  destroy() {
    this.display.destroy();
  }

  onGameSizeChanged(gameWidth: number, gameHeight: number) {
    for (let particle of this.particles) {
      [particle.x, particle.y, particle.z] =
          ParticlesField.getRandomCoordinates(gameWidth, gameHeight);
    }
  }

  async approach(duration: number, easing: (x: number) => number) {
    let speedTween = this.game.add.tween(this)
        .to({particleSpeed: -this.particleSpeed * 3}, duration, easing, true);
    return new Promise(resolve => {
      speedTween.onComplete.addOnce(resolve);
    });
  }
}

export default ParticlesField;
