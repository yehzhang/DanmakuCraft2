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
import {NotificationPriority} from '../render/notification/Notifier';
import ConfigProvider from '../environment/config/ConfigProvider';
import Visibility from '../engine/visibility/Visibility';
import CommentDataUtil from '../../../scripts/CommentDataUtil';
import {Player} from '../entitySystem/alias';
import {Phaser} from './alias/phaser';

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

  static set(universe: Universe) {
    // TODO any idea how to expose all modules while debugging?
    Object.assign(window, {
      universe,
      game: universe.game,
      CommentData,
      BuffData,
      Colors,
      Point,
      ChestBuilder,
      SpeechBubbleBuilder,
      Distance,
      asSequence,
      PhysicalConstants,
    });

    let debug = new this(universe);

    (window as any).db = debug;

    return debug;
  }

  get say() {
    this.universe.notifier.send(this.getNotificationMessage());
    return this.universe.notifier;
  }

  get shout() {
    this.universe.notifier.send(this.getNotificationMessage(), NotificationPriority.SKIP);
    return this.universe.notifier;
  }

  get fill() {
    let config = ConfigProvider.get();
    return new Promise<Document>((resolve, reject) => $.ajax({
      type: 'GET',
      url: config.baseUrl + config.defaultBatchCommentsPath,
      dataType: 'xml',
      success: resolve,
      error: reject,
    }))
        .then(document => {
          let commentsData = CommentDataUtil.parseFromDocument(document);
          return this.universe.commentLoader.loadBatch(commentsData);
        });
  }

  get hideInfo() {
    this.showInfo = false;
    this.debugInfo.clear();

    this.universe.game.time.advancedTiming = false;

    return true;
  }

  onCreate() {
    if (__STAGE__) {
      let ignored = this.fill;
    }
  }

  addComment(
      coordinates: Point = this.universe.player.coordinates,
      text: string = Debug.DEFAULT_COMMENT_TEXT,
      color: number = Debug.DEFAULT_COMMENT_COLOR,
      buffData: BuffData | null = null) {
    this.createComment(coordinates, text, color, buffData);
  }

  private render() {
    if (!this.showInfo) {
      return;
    }

    this.debugInfo.start();

    asSequence(this.universe.chestsStorage.getFinder())
        .forEach(
            chest => this.debugInfo.line('Chest', chest.coordinates, chest.isOpen ? 'opened' : ''));

    // TODO refactor to add to container system
    // let closestComment: Entity =
    // asSequence(this.universe.visibility.collisionDetectionSystem['currentRegions'])
    // .flatMap(region => asSequence(region.container)) .minBy((entity: any) =>
    // Distance.roughlyOf(entity.coordinates, this.universe.player.coordinates)) as any; if
    // (closestComment) { this.debugInfo.line( 'Comment', closestComment.coordinates,
    // UpdatingBuffCarrier.isTypeOf(closestComment) ? 'updating' : ''); }
  }

  private getNotificationMessage() {
    let message = `测试${this.notificationShowCounts++}`;
    message += message;
    message += message;
    message += message;
    message += message;
    return message;
  }

  private createComment(
      coordinates: Point,
      text: string,
      color: number,
      buffData: BuffData | null) {
    return this.universe.commentLoader.load(
        new CommentData(25, color, text, coordinates, buffData));
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
