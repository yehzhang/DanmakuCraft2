import {Player} from './entity/entity';
import EntityProjector from './update/EntityProjector';
import {Existent} from './law';

export default class Renderer implements Existent {
  private container: PIXI.DisplayObjectContainer;

  constructor(game: Phaser.Game, private player: Player, entityProjector: EntityProjector) {
    this.container = new PIXI.DisplayObjectContainer();

    let playerDisplay = this.player.display();
    Renderer.centerPlayerDisplay(playerDisplay, game.width, game.height);
    this.container.addChild(playerDisplay);

    let entitiesDisplay = entityProjector.display();
    entitiesDisplay.position = playerDisplay.position.clone();
    this.container.addChild(entitiesDisplay);

    game.scale.onSizeChange.add(this.onGameResize, this);
  }

  private onGameResize(gameWidth: number, gameHeight: number) {
    let playerDisplay = this.player.display();
    Renderer.centerPlayerDisplay(playerDisplay, gameWidth, gameHeight);
  }

  private static centerPlayerDisplay(
      playerDisplay: PIXI.DisplayObjectContainer, parentWidth: number, parentHeight: number) {
    playerDisplay.x = (parentWidth - playerDisplay.width) / 2;
    playerDisplay.y = (parentHeight - playerDisplay.height) / 2;
  }

  display(): PIXI.DisplayObjectContainer {
    return this.container;
  }
}
