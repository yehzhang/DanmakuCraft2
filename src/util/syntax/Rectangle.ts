class Rectangle extends Phaser.Rectangle {
  static of(x: number, y: number, width: number, height: number) {
    return new this(x, y, width, height);
  }

  static none() {
    return new this(0, 0, 0, 0);
  }
}

export default Rectangle;
