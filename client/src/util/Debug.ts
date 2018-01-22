import Universe from '../Universe';
import Colors from '../render/Colors';
import CommentData from '../comment/CommentData';
import {BuffData, BuffType} from '../entitySystem/system/buff/BuffData';
import ChestBuilder from '../render/graphics/ChestBuilder';
import SpeechBubbleBuilder from '../render/graphics/SpeechBubbleBuilder';
import Point from './syntax/Point';
import PhysicalConstants from '../PhysicalConstants';
import {toWorldCoordinateOffset2d} from '../law/space';
import {asSequence} from 'sequency';
import Distance from './math/Distance';
import {NotificationPriority} from '../output/notification/Notifier';
import ConfigProvider from '../environment/config/ConfigProvider';
import Visibility from '../engine/visibility/Visibility';
import {Player} from '../entitySystem/alias';
import {Phaser} from './alias/phaser';
import Sleep from './async/Sleep';

class Debug {
  private static readonly DEFAULT_COMMENT_TEXT = '测试弹幕';
  private static readonly DEFAULT_COMMENT_COLOR = Colors.WHITE_NUMBER;

  constructor(
      private universe: Universe,
      public showInfo: boolean = true,
      private notificationShowCounts: number = 0,
      private systems: { [systemName: string]: any } = {},
      private debugInfo: DebugInfo = new DebugInfo(universe.game, universe.player)) {
    universe.render = inject(this.render.bind(this), universe.render.bind(universe));

    if (__DEV__) {
      universe.player.moveSpeedBoostRatio = 10;
    } else {
      universe.player.moveSpeedBoostRatio = PhysicalConstants.HASTY_BOOST_RATIO;
    }

    asSequence(universe.visibility['engines']).flatMap(
        engine => asSequence([engine['onUpdateSystemTickers'], engine['onRenderSystemTickers']]))
        .plus<any>(asSequence(universe.existence['engines']).flatMap(
            engine => asSequence([engine['onUpdateRelations'], engine['onRenderRelations']])))
        .flatten()
        .map(systemHolder => (systemHolder as any)['system'])
        .distinct()
        .forEach(system => {
          let systemName = system.constructor.name;
          systemName = systemName.charAt(0).toLowerCase() + systemName.slice(1);
          if (systems.hasOwnProperty(systemName)) {
            if (systems[systemName] instanceof Array) {
              systems[systemName].push(system);
            } else {
              systems[systemName] = [systems[systemName], system];
            }
          } else {
            systems[systemName] = system;
          }
        });

    universe.game.time.advancedTiming = true;
  }

  get chest() {
    let chestCoordinates = this.universe.player.coordinates.clone().add(0, -100);
    return this.systems.chestSystem['chestSpawner']['spawnAt'](chestCoordinates);
  }

  get comment() {
    return this.addComment();
  }

  get chromatic() {
    return this.addComment(
        this.universe.player.coordinates,
        Debug.DEFAULT_COMMENT_TEXT,
        Colors.WHITE_NUMBER,
        new BuffData(BuffType.CHROMATIC));
  }

  get currentEntities() {
    let distance = this.getVisibleDistance();
    return asSequence(this.universe.visibility['engines'])
        .map(engine => engine['entityFinderRecords'])
        .flatten()
        .map(record => record.currentEntities)
        .flatten()
        .filter(entity => distance.isClose(entity.coordinates, this.universe.player.coordinates))
        .toArray();
  }

  get currentDisplays() {
    let distance = this.getVisibleDistance();
    return asSequence(this.universe.renderer['stage'].children as PIXI.DisplayObjectContainer[])
        .map(child => child.children)
        .flatten()
        .map(child => (child as PIXI.DisplayObjectContainer).children)
        .flatten()
        .filter(
            display => distance.isClose(display.position, this.universe.player.display.position))
        .toArray();
  }

  set playerCoordinates(coordinates: Point) {
    this.movePlayerBy(Phaser.Point.subtract(coordinates, this.universe.player.coordinates));
  }

  set playerOffset(offset: number) {
    this.movePlayerBy(Point.of(offset, offset));
  }

  static set(universe: Universe) {
    Object.assign(window, universe, {
      universe,
      CommentData,
      BuffData,
      Colors,
      Point,
      ChestBuilder,
      SpeechBubbleBuilder,
      Distance,
      asSequence,
      PhysicalConstants,
      ConfigProvider,
      Sleep,
    });

    let debug = new this(universe);

    (window as any).db = debug;

    return debug;
  }

  private movePlayerBy(offset: Point) {
    let ignored = this.universe.visibility.synchronizeUpdateSystem.for(() => {
      this.universe.player.addToCoordinatesBy(offset);
      this.universe.player.movedOffset.add(offset.x, offset.y);
    });
  }

  private getVisibleDistance() {
    return new Distance(this.universe.game.width / 2);
  }

  get say() {
    this.universe.notifier.send(this.getNotificationMessage());
    return this.universe.notifier;
  }

  get shout() {
    this.universe.notifier.send(this.getNotificationMessage(), NotificationPriority.SKIP);
    return this.universe.notifier;
  }

  get hideInfo() {
    this.showInfo = false;
    this.debugInfo.clear();

    this.universe.game.time.advancedTiming = false;

    return true;
  }

  addComment(
      coordinates: Point = this.universe.player.coordinates,
      text: string = Debug.DEFAULT_COMMENT_TEXT,
      color: number = Debug.DEFAULT_COMMENT_COLOR,
      buffData: BuffData | null = null) {
    return this.universe.commentLoader.load(
        new CommentData(25, color, text, coordinates, buffData), true);
  }

  private render() {
    if (!this.showInfo) {
      return;
    }

    this.debugInfo.start();

    asSequence(this.universe.chestsStorage.getFinder())
        .forEach(
            chest => this.debugInfo.line('Chest', chest.coordinates, chest.isOpen ? 'opened' : ''));

    let closestSign = asSequence(this.universe.signsStorage.getFinder())
        .minBy(sign => Distance.roughlyOf(sign.coordinates, this.universe.player.coordinates));
    if (closestSign) {
      let note;
      if (closestSign.display instanceof Phaser.Text) {
        note = closestSign.display.text;
      } else {
        note = undefined;
      }
      this.debugInfo.line('Sign', closestSign.coordinates, note);
    }

    let previewEntity = (this.universe.proxy.getCommentPlacingPolicy() as any)['previewEntity'];
    if (previewEntity != null) {
      this.universe.game.debug.spriteBounds(previewEntity.display);
    }
  }

  private getNotificationMessage() {
    let message = `测试${this.notificationShowCounts++}`;
    message += message;
    message += message;
    message += message;
    message += message;
    return message;
  }
}

export default Debug;

function inject(fun: (...args: any[]) => void, other: (...args: any[]) => void = () => {
}) {
  return (...args: any[]) => {
    fun.apply(null, args);
    other.apply(null, args);
  };
}

class DebugInfo {
  constructor(
      private game: Phaser.Game,
      private player: Player,
      private currentY: number = 20,
      private lineHeight: number = 18) {
  }

  private static getDirection(offset: number, tolerance: number = 200) {
    if (Math.abs(offset) < tolerance) {
      return 0;
    }
    if (offset > 0) {
      return 1;
    }
    return 2;
  }

  line(text: string, coordinates?: Point, note?: string, disableNavigation?: boolean) {
    if (note) {
      text = `${text}(${note})`;
    }

    if (coordinates !== undefined) {
      coordinates = coordinates.clone().floor();

      let navigation;
      if (disableNavigation) {
        navigation = '';
      } else {
        let offset = toWorldCoordinateOffset2d(
            this.player.coordinates,
            coordinates,
            PhysicalConstants.WORLD_SIZE);
        let horizontalDirection = DebugInfo.getDirection(offset.x);
        let verticalDirection = DebugInfo.getDirection(offset.y);
        let direction = '•←→↑↖↗↓↙↘'.charAt(horizontalDirection + verticalDirection * 3);
        let distance = Math.round(offset.getMagnitude());
        navigation = ` ${direction} (${distance})`;
      }

      text = `${text}: (${coordinates.x}, ${coordinates.y})${navigation}`;
    }

    this.game.debug.text(text, 10, this.getHeight(), Colors.GOLD);

    return this;
  }

  start() {
    this.currentY = 0;

    this.line('Player', this.player.coordinates, '', true);
    this.line(`FPS: ${this.game.time.fps}`);
    this.line(`Render radius: ${Visibility['getRenderRadius'](this.game)}`);
    this.line(`Camera focus`, this.game.camera.position, undefined, true);

    return this;
  }

  private getHeight() {
    return this.currentY += this.lineHeight;
  }

  clear() {
    this.game.debug.reset();
  }
}
