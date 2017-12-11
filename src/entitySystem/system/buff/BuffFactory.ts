import Moving from './Moving';
import Chromatic from './Chromatic';
import Ethereal from './Ethereal';
import Buff from './Buff';

export enum BuffType {
  ETHEREAL = 0,  // nothing
  CHROMATIC = 1,  // colorful comment
  SHAPELY = 2,  // simple geometry
  GRAPHICAL = 3,  // bitmap image
  KINETIC = 4,  // moving comment
  BLAZING = 5,  // tiny firework
  ELEGANT = 6,  // different font
  HASTY = 7,  // move fast
}

export class BuffData {
  constructor(public readonly type: number, public readonly parameter: number) {
  }

  toString() {
    return `Type: ${this.type}; Parameter: ${this.parameter}`;
  }
}

interface BuffFactory {
  create(data: BuffData): Buff;

  createEthereal(): Ethereal;

  createInputControllerMover(): Moving;

  createWorldWanderingMover(): Moving;

  createChromatic(): Chromatic;
}

export default BuffFactory;
