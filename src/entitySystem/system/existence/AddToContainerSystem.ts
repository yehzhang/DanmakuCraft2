import ExistenceSystem from './ExistenceSystem';
import {Renderable, RenderableEntity} from '../../alias';
import PIXI = require('phaser-ce-type-updated/build/custom/pixi');

class AddToContainerSystem implements ExistenceSystem<RenderableEntity> {
  constructor(
      parentContainer: PIXI.DisplayObjectContainer,
      private container: PIXI.DisplayObjectContainer = new BridgingContainer()) {
    parentContainer.addChild(container);
  }

  enter(entity: RenderableEntity) {
    this.container.addChild(entity.display);
  }

  exit(entity: Renderable) {
    this.container.removeChild(entity.display);
  }

  finish() {
  }
}

export default AddToContainerSystem;

class BridgingContainer extends PIXI.DisplayObjectContainer {
  // noinspection JSUnusedGlobalSymbols
  preUpdate() {
  }

  // noinspection JSUnusedGlobalSymbols
  update() {
  }

  // noinspection JSUnusedGlobalSymbols
  postUpdate() {
  }
}
