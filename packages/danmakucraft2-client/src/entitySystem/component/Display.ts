import {throwNominalTypePlaceholderError} from '../../util/nominalType';
import PIXI = require('phaser-ce-type-updated/build/custom/pixi');

class Display<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  constructor(public display: T) {
  }

  private __Display__() {
    return throwNominalTypePlaceholderError();
  }
}

export default Display;
