import {throwNominalTypePlaceholderError} from '../../util/nominalType';
import {PIXI} from '../../util/alias/phaser';

class Display<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  constructor(public display: T) {
  }

  private __Display__() {
    return throwNominalTypePlaceholderError();
  }
}

export default Display;
