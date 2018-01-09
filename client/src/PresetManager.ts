import Point from './util/syntax/Point';

export default class PresetManager {
  private static SPAWN_POINTS = [
    {posX: 0.260, posY: 0.265, sign: '8'}, // NW 8100, 8748
    {posX: 0.505, posY: 0.290, sign: '1'}, // N 16200, 7128
    {posX: 0.750, posY: 0.270, sign: '6'}, // NE 23004, 8424
    {posX: 0.270, posY: 0.495, sign: '3'}, // W 7452, 15876
    {posX: 0.730, posY: 0.510, sign: '7'}, // E 24624, 16524
    {posX: 0.280, posY: 0.740, sign: '4'}, // SW 8424, 23004
    {posX: 0.510, posY: 0.725, sign: '⑨'}, // S 16524, 24948
    {posX: 0.740, posY: 0.735, sign: '2'}  // SE 24300, 23652
  ];

  getPlayerSpawnPoint(): Point {
    throw new Error('Not implemented');
  }
}

class Preset {
  constructor(
      public readonly percentageX: number,
      public readonly percentageY: number,
      ) {
  }
}
