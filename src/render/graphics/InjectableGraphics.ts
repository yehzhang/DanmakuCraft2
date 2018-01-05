import Graphics from './Graphics';

class InjectableGraphics implements Graphics {
  constructor(
      private graphics: Phaser.Graphics,
      private offsetY = 0,
      private offsetX = 0,
      private fillColor: number | null = null,
      private lineColor: number | null = null,
      private scale: number = 1) {
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
    if (this.fillColor != null) {
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
    this.graphics.moveTo(x * this.scale + this.offsetX, y * this.scale + this.offsetY);
    return this;
  }

  lineTo(x: number, y: number) {
    this.graphics.lineTo(x * this.scale + this.offsetX, y * this.scale + this.offsetY);
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
      paths[i] = paths[i] * this.scale + this.offsetX;
      paths[i + 1] = paths[i + 1] * this.scale + this.offsetY;
    }
    this.graphics.drawPolygon(paths);

    return this;
  }

  drawRect(x: number, y: number, width: number, height: number) {
    this.graphics.drawRect(
        x * this.scale + this.offsetX,
        y * this.scale + this.offsetY,
        width * this.scale,
        height * this.scale);
    return this;
  }

  drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    this.graphics.drawRoundedRect(
        x * this.scale + this.offsetX,
        y * this.scale + this.offsetY,
        width * this.scale,
        height * this.scale,
        radius * this.scale);
    return this;
  }

  curveTo(cpX: number, cpY: number, toX: number, toY: number) {
    return this.bezierCurveTo(cpX, cpY, cpX, cpY, toX, toY);
  }

  bezierCurveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number) {
    this.graphics.bezierCurveTo(
        cpX * this.scale + this.offsetX,
        cpY * this.scale + this.offsetY,
        cpX2 * this.scale + this.offsetX,
        cpY2 * this.scale + this.offsetY,
        toX * this.scale + this.offsetX,
        toY * this.scale + this.offsetY);
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

  getGraphics() {
    return this.graphics;
  }

  multiplyScaleBy(scale: number) {
    this.scale *= scale;
    return this;
  }
}

export default InjectableGraphics;
