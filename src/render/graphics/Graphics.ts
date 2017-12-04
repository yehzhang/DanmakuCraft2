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

export class InjectableGraphics implements Graphics {
  private offsetY: number;
  private offsetX: number;
  private graphics: PIXI.Graphics;
  private fillColor: number | null;
  private lineColor: number | null;

  constructor() {
    this.graphics = new PIXI.Graphics();
    this.offsetX = 0;
    this.offsetY = 0;
    this.fillColor = null;
    this.lineColor = null;
  }

  fixFillColor(fillColor: number) {
    if (this.fillColor != null) {
      throw new TypeError('Fillcolor is already set');
    }

    this.fillColor = fillColor;

    return this;
  }

  clearFillColor() {
    this.fillColor = null;
    return this;
  }

  fixLineColor(lineColor: number) {
    if (this.lineColor != null) {
      throw new TypeError('LineColor is already set');
    }

    this.lineColor = lineColor;

    return this;
  }

  clearLineColor() {
    this.lineColor = null;
    return this;
  }

  beginFill(color?: number, alpha?: number) {
    if (this.fillColor !== null) {
      color = this.fillColor;
    }

    this.graphics.beginFill(color, alpha);
    return this;
  }

  endFill() {
    this.graphics.endFill();
    return this;
  }

  moveTo(x: number, y: number) {
    this.graphics.moveTo(x + this.offsetX, y + this.offsetY);
    return this;
  }

  lineTo(x: number, y: number) {
    this.graphics.lineTo(x + this.offsetX, y + this.offsetY);
    return this;
  }

  lineStyle(lineWidth?: number, color?: number, alpha?: number) {
    if (this.lineColor !== null) {
      color = this.lineColor;
    }

    this.graphics.lineStyle(lineWidth, color, alpha);
    return this;
  }

  drawPolygon(paths: Phaser.Polygon | number[]) {
    if (paths instanceof Phaser.Polygon) {
      paths = paths.toNumberArray();
    }

    for (let i = 0; i < paths.length; i += 2) {
      paths[i] += this.offsetX;
      paths[i + 1] += this.offsetY;
    }
    this.graphics.drawPolygon(paths);

    return this;
  }

  curveTo(cpX: number, cpY: number, toX: number, toY: number) {
    // TODO it this correct?
    return this.bezierCurveTo(cpX, cpY, cpX, cpY, toX, toY);
  }

  bezierCurveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number) {
    this.graphics.bezierCurveTo(
        cpX + this.offsetX,
        cpY + this.offsetY,
        cpX2 + this.offsetX,
        cpY2 + this.offsetY,
        toX + this.offsetX,
        toY + this.offsetY);
    return this;
  }

  generateTexture(resolution?: number, scaleMode?: number, padding?: number) {
    return this.graphics.generateTexture(resolution, scaleMode, padding);
  }

  addOffsetBy(x: number, y: number) {
    this.offsetX += x;
    this.offsetY += y;

    return this;
  }

  getLocalBounds() {
    return this.graphics.getLocalBounds();
  }
}
