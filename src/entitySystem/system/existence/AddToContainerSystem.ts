import ExistenceSystem from './ExistenceSystem';
import {Renderable, RenderableEntity} from '../../alias';
import Point from '../../../util/syntax/Point';
import PIXI = require('phaser-ce-type-updated/build/custom/pixi');

class AddToContainerSystem implements ExistenceSystem<RenderableEntity> {
  constructor(
      private anchor: RenderableEntity, // TODO refactor to set position system?
      parentContainer: Phaser.Group,
      private container: PIXI.DisplayObjectContainer = new BridgingContainer()) {
    parentContainer.addChild(container);
  }

  enter(entity: RenderableEntity) {
    this.container.addChild(entity.display);
    entity.display.position =
        Point.add(entity.asOffsetTo(this.anchor.coordinates), this.anchor.display.position);
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
