export default interface Graphics {
  beginFill(color?: number, alpha?: number): this;

  endFill(): this;

  moveTo(x: number, y: number): this;

  lineTo(x: number, y: number): this;

  lineStyle(lineWidth?: number, color?: number, alpha?: number): this;

  drawPolygon(paths: Phaser.Polygon | number[]): this;

  curveTo(cpX: number, cpY: number, toX: number, toY: number): this;

  bezierCurveTo(
      cpX: number,
      cpY: number,
      cpX2: number,
      cpY2: number,
      toX: number,
      toY: number): this;

  getLocalBounds(): PIXI.Rectangle;
}
