import Preset from './Preset';
import Point from '../util/syntax/Point';
import EntityFactory from '../entitySystem/EntityFactory';
import Entity from '../entitySystem/Entity';
import Colors from '../render/Colors';
import EntityRegister from '../util/entityStorage/EntityRegister';
import {SignEntity} from '../entitySystem/alias';
import GraphicsFactory from '../render/graphics/GraphicsFactory';

class PresetPoint<T> {
  constructor(readonly x: number, readonly y: number, readonly data: T) {
  }

  get coordinates() {
    return Point.of(this.x, this.y);
  }
}

class HardCodedPreset implements Preset {
  private static readonly SIGN_SIZE = 94;

  private static readonly SPAWN_POINTS = [
    new PresetPoint(8100, 8748, '8'), // NW
    new PresetPoint(16200, 7128, '1'), // N
    new PresetPoint(23004, 8424, '6'), // NE
    new PresetPoint(7452, 15876, '3'), // W
    new PresetPoint(24624, 16524, '7'), // E
    new PresetPoint(8424, 23004, '4'), // SW
    new PresetPoint(16524, 24948, '⑨'), // S
    new PresetPoint(24300, 23652, '2')  // SE
  ];

  private static readonly WORLD_CENTER_COORDINATES = Point.of(16200, 16200);
  private static readonly WORLD_ORIGIN_COORDINATES = Point.origin();

  constructor(
      private entityFactory: EntityFactory,
      private simpleRandom: Phaser.RandomDataGenerator,
      private graphicsFactory: GraphicsFactory) {
  }

  // getPlayerSpawnPoint(commentsRegister: EntityRegister<CommentEntity>): Point {
  getPlayerSpawnPoint(): Point {
    // TODO
    throw new TypeError('Not implemented');
    // asSequence(commentsRegister)
    //     .drop(commentsRegister.count() * 0.9);
    // let spawnPoint = this.random.pick(HardCodedPreset.SPAWN_POINTS);
    // this.entityFactory.createSignEntity(this.graphicsFactory.cre);
    // Chain.total(seededRandom)
    //     .pipe(Scaler.to(0, Phaser.Math.PI2))
    //     .pipe(Const.of(azimuth => {
    //       let radius = renderRadius.getValue() - 1;
    //       let offset = Point.origin().setToPolar(azimuth, radius);
    //       return Phaser.Point.add(trackee.coordinates, offset);
    //     }))
    //     .build();
  }

  populateSpawnPoints(
      pointsRegister: EntityRegister<Entity>, signsRegister: EntityRegister<SignEntity>) {
    for (let point of HardCodedPreset.SPAWN_POINTS) {
      let pointEntity = this.entityFactory.createPointEntity(point.coordinates);
      pointsRegister.register(pointEntity);

      let display =
          this.graphicsFactory.createText(point.data, HardCodedPreset.SIGN_SIZE, Colors.GOLD);
      display.anchor.setTo(0.5);
      let signEntity = this.entityFactory.createSignEntity(pointEntity.coordinates, display);
      signsRegister.register(signEntity);
    }
  }

  populateSigns(signsRegister: EntityRegister<SignEntity>) {
    let worldCenter = this.entityFactory.createSignEntity(
        HardCodedPreset.WORLD_CENTER_COORDINATES,
        this.graphicsFactory.createWorldCenterSign(HardCodedPreset.SIGN_SIZE, Colors.GOLD));
    signsRegister.register(worldCenter);

    let worldOrigin = this.entityFactory.createSignEntity(
        HardCodedPreset.WORLD_ORIGIN_COORDINATES,
        this.graphicsFactory.createWorldOriginSign(HardCodedPreset.SIGN_SIZE, Colors.GOLD));
    signsRegister.register(worldOrigin);
  }
}

export default HardCodedPreset;
