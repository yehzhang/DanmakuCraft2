import {EnvironmentAdapter, WorldProxy} from './environment/components';

export default class DanmakuCraft {
  game: Phaser.Game;

  constructor(adapter: EnvironmentAdapter) {
    this.game = new Phaser.Game(
        '100',
        '100',
        Phaser.AUTO,
        adapter.getGameContainerProvider().getContainer(),
        {
          create: this.create,
          preload: this.preload,
        });
  }

  preload() {
    this.game.load.image('logo', 'phaser2.png');
  }

  create() {
    let logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');

    logo.anchor.setTo(0.5, 0.5);
    logo.scale.setTo(0.2, 0.2);

    this.game.add.tween(logo.scale).to({x: 1, y: 1}, 2000, Phaser.Easing.Bounce.Out, true);
  }

  getProxy(): WorldProxy {
    // TODO
    throw new Error('Not implemented');
  }
}
