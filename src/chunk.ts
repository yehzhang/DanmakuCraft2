import {Entity, EntityManager, Region} from './entity';

/**
 * Implements {@link EntityManager} with arrays of {@link Chunk}s.
 */
export class ArrayEntityManager<E extends Entity = Entity> implements EntityManager<E> {
  private renderChunksCount: number;
  private chunkSize: number;
  private chunksCount: number;
  private chunks: Array<Array<Chunk<E>>>;

  /**
   * @param worldSize Size of the world.
   * @param chunksCount Number of chunks in a certain dimension.
   * @param renderDistance Minimum distance in world coordinate to render around a point.
   */
  constructor(worldSize: number, chunksCount: number, renderDistance: number) {
    this.chunksCount = Math.floor(chunksCount);
    this.chunkSize = worldSize / this.chunksCount;
    this.renderChunksCount = Math.ceil(renderDistance / this.chunkSize);
    this.chunks = ArrayEntityManager.makeChunks(this.chunksCount);

    if (worldSize <= 0) {
      throw new Error('Invalid world size');
    }

    if (this.chunksCount <= 0) {
      throw new Error('Invalid chunks count');
    }

    if (this.renderChunksCount <= 0) {
      throw new Error('Invalid render distance');
    }
    if (this.renderChunksCount * this.chunkSize * 2 > worldSize) {
      throw new Error('Render distance too large');
    }
  }

  private static makeChunks<E extends Entity>(chunksCount: number): Array<Array<Chunk<E>>> {
    let regions = [];

    for (let y = 0; y < chunksCount; y++) {
      let regionsRow = [];

      for (let x = 0; x < chunksCount; x++) {
        let id = y * chunksCount + x;
        regionsRow.push(new Chunk<E>(id));
      }

      regions.push(regionsRow);
    }

    return regions;
  }

  loadBatch(entities: E[]): void {
    entities.forEach(this.load.bind(this));
  }

  load(entity: E): void {
    let coordinate = this.toChunkCoordinate(entity.getPosition());
    let region = this.getChunk(coordinate);
    region.addEntity(entity);
  }

  listRenderableRegions(worldCoordinate: Phaser.Point): Array<Region<E>> {
    let coordinate = this.toChunkCoordinate(worldCoordinate);
    return this.getNChunksAround(coordinate, this.renderChunksCount);
  }

  leftOuterJoinRenderableRegions(
      worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point): Array<Region<E>> {
    let leftCoordinate = this.toChunkCoordinate(worldCoordinate);
    let rightCoordinate = this.toChunkCoordinate(otherCoordinate);
    if (leftCoordinate.equals(rightCoordinate)) {
      return [];
    }

    // Collect all regions in either vertical or horizontal area.
    // Case 1:
    // V V H H
    // V V H H
    // V V H H
    // V V o o o o
    //     o o o o
    //     o o o o
    //     o o o o
    //
    // Case 2:
    // o o o o
    // o o o o
    // o o o o
    // o o o o V V
    //     H H V V
    //     H H V V
    //     H H V V
    let regions: Array<Region<E>> = [];

    // Collect regions in vertical area.
    // TODO handle world-wrapping
    let leftBound = new Phaser.Rectangle(leftCoordinate.x, leftCoordinate.y, 0, 0)
        .inflate(this.renderChunksCount, this.renderChunksCount);
    let rightBound = new Phaser.Rectangle(rightCoordinate.x, rightCoordinate.y, 0, 0)
        .inflate(this.renderChunksCount, this.renderChunksCount);
    if (leftCoordinate.x !== rightCoordinate.x) {
      let left;
      let right;
      if (leftCoordinate.x < rightCoordinate.x) {
        left = leftBound.left;
        right = rightBound.left - 1;
      } else {
        left = rightBound.right + 1;
        right = leftBound.right;
      }

      let top = leftBound.top;
      let bottom = leftBound.bottom;
      this.pushChunksInBound(left, right, top, bottom, regions);
    }

    // Collect regions in horizontal area.
    if (leftCoordinate.y !== rightCoordinate.y) {
      let left;
      let right;
      if (leftCoordinate.x < rightCoordinate.x) {
        left = rightBound.left;
        right = leftBound.right;
      } else {
        left = leftBound.left;
        right = rightBound.right;
      }

      let top;
      let bottom;
      if (leftCoordinate.y < rightCoordinate.y) {
        top = leftBound.top;
        bottom = rightBound.top - 1;
      } else {
        top = rightBound.bottom + 1;
        bottom = leftBound.bottom;
      }

      this.pushChunksInBound(left, right, top, bottom, regions);
    }

    return regions;
  }

  private getNChunksAround(chunkCoordinate: Phaser.Point, n: number): Array<Region<E>> {
    let regions = [];
    for (let deltaY = -n; deltaY <= n; deltaY++) {
      let y = (chunkCoordinate.y + deltaY + this.chunksCount) % this.chunksCount;
      for (let deltaX = -n; deltaX <= n; deltaX++) {
        let x = (chunkCoordinate.x + deltaX + this.chunksCount) % this.chunksCount;
        regions.push(this.chunks[y][x]);
      }
    }
    return regions;
  }

  /**
   * Expects a non-wrapping bound.
   */
  private pushChunksInBound(
      left: number,
      right: number,
      top: number,
      bottom: number,
      regions: Array<Region<E>>): void {
    for (let indexY = top; indexY <= bottom; indexY++) {
      for (let indexX = left; indexX <= right; indexX++) {
        regions.push(this.chunks[indexY][indexX]);
      }
    }
  }

  private toChunkCoordinate(worldCoordinate: Phaser.Point): Phaser.Point {
    let coordinate = worldCoordinate.clone().divide(this.chunkSize, this.chunkSize).floor();

    if (!(coordinate.x < this.chunksCount
            && coordinate.x >= 0
            && coordinate.y < this.chunksCount
            && coordinate.y >= 0)) {
      throw new Error('Invalid world coordinate');
    }

    return coordinate;
  }

  private getChunk(coordinate: Phaser.Point) {
    return this.chunks[coordinate.y][coordinate.x];
  }
}

/**
 * Implements {@link Region} with an array.
 */
export class Chunk<E extends Entity> implements Region<E> {
  private entities: E[];

  constructor(public readonly id: number) {
    this.entities = [];
  }

  addEntity(entity: E) {
    this.entities.push(entity);
  }

  countEntities() {
    return this.entities.length;
  }

  forEach(f: (entity: E) => void) {
    this.entities.forEach(f);
  }
}
