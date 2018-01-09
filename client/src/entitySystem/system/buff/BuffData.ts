export enum BuffType {
  NONE = 0,
  CHROMATIC = 1,  // colorful comment
  SHAPELY = 2,  // simple geometry
  GRAPHICAL = 3,  // bitmap image
  KINETIC = 4,  // moving comment
  BLAZING = 5,  // tiny firework
  ELEGANT = 6,  // different font
  HASTY = 7,  // move fast
}

export class BuffData {
  constructor(readonly type: BuffType, readonly parameter: number = 0) {
    if (BuffType[type] == null) {
      throw new TypeError(`Invalid buff type '${type}'`);
    }
  }

  toString() {
    return `Type: ${this.type}; Parameter: ${this.parameter}`;
  }
}
