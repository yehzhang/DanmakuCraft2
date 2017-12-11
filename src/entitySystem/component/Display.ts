import {throwNominalTypePlaceholderError} from '../../util/nominalType';

class Display<T extends PIXI.DisplayObject = PIXI.DisplayObject> {
  constructor(public display: T) {
  }

  private __Display__() {
    return throwNominalTypePlaceholderError();
  }
}

export default Display;
