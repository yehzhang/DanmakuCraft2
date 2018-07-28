import {asSequence} from 'sequency';
import CommentData from '../comment/CommentData';
import {getRenderRadius} from '../engine/visibility/Visibility';
import {DisplayableEntity, Player} from '../entitySystem/alias';
import Nudge from '../entitySystem/component/Nudge';
import {BuffData, BuffType} from '../entitySystem/system/buff/BuffData';
import ConfigProvider from '../environment/config/ConfigProvider';
import {toWorldCoordinateOffset2d} from '../law/space';
import {NotificationPriority} from '../output/notification/Notifier';
import PhysicalConstants from '../PhysicalConstants';
import HardCodedPreset from '../preset/HardCodedPreset';
import Colors from '../render/Colors';
import ChestBuilder from '../render/graphics/ChestBuilder';
import SpeechBubbleBuilder from '../render/graphics/SpeechBubbleBuilder';
import Universe from '../Universe';
import {Phaser} from './alias/phaser';
import Sleep from './async/Sleep';
import Distance from './math/Distance';
import Point from './syntax/Point';

/**
 * Usage: in browser console, enter `d.comment`, `d.chest`, etc.
 */
class Debug {
  private static readonly DEFAULT_COMMENT_TEXT = '测试弹幕';
  private static readonly DEFAULT_COMMENT_COLOR = Colors.WHITE_NUMBER;

  constructor(
      private universe: Universe,
      public shouldShowInfo: boolean = true,
      private notificationShowCounts: number = 0,
      private systems: { [systemName: string]: any } = {},
      private debugInfo: DebugInfo = new DebugInfo(universe.game, universe.player)) {
    universe.engineCap.render = ((render) => async () => {
      await this.render();
      await render.call(universe.engineCap);
    })(universe.engineCap.render);

    asSequence(universe.visibility['engines'])
        .map(engine => [engine['onUpdateTickers'], engine['onRenderTickers']])
        .plus<any[]>(asSequence(universe.existence['engines'])
            .map(engine => [engine['onUpdateRelations'], engine['onRenderRelations']]))
        .plus<any[]>(asSequence([universe.tick.beforeVisibility, universe.tick.afterVisibility])
            .map(engine => [engine['onUpdateTickers'], engine['onRenderTickers']]))
        .flatten()
        .flatten()
        .flatMap((systemHolder: any) => {
          if (systemHolder.hasOwnProperty('systems')) {
            return asSequence(systemHolder.systems);
          }
          return asSequence([systemHolder]);
        })
        .map((systemHolder: any) => {
          while (systemHolder.hasOwnProperty('system')) {
            systemHolder = systemHolder.system;
          }
          return systemHolder;
        })
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

    this.applyGameState();
  }

  get hideInfo() {
    this.shouldShowInfo = false;
    this.debugInfo.clear();

    return true;
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

  get preview() {
    this.universe.commentPlacingPolicy.requestFor('测试弹幕 ABCD', 25, Colors.GOLD_NUMBER);
    return (this.universe.commentPlacingPolicy as any)['previewDisplay'];
  }

  private movePlayerBy(offset: Point) {
    setTimeout(() => {
      this.universe.player.addToCoordinatesBy(offset);
      this.universe.player.movedOffset.add(offset.x, offset.y);
    }, 0);
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

  get showInfo() {
    this.shouldShowInfo = true;
    return true;
  }

  get fly() {
    this.universe.player.moveSpeedBoostRatio = 20;
    return true;
  }

  get hidePreview() {
    this.universe.commentPlacingPolicy.cancelRequest();
    return true;
  }

  // get treeDepths() {
  //   const depthsMap = asSequence(this.universe.commentsStorage.getFinder() as
  // EntityFinder<Leaf<any>>) .map(n => n['depth']) .groupBy(n => n); return asSequence(depthsMap)
  // .sortedBy(([k]) => k) .map(([k, v]) => `${k}: ${v.length}`) .toArray(); }

  get mute() {
    this.universe.backgroundMusicPlayer.setVolume(0);
    return true;
  }

  get run() {
    this.universe.player.moveSpeedBoostRatio = 5;
    return true;
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
      Nudge,
    });

    let debug = new this(universe);

    (window as any).d = debug;

    return debug;
  }

  get walk() {
    this.universe.player.moveSpeedBoostRatio = PhysicalConstants.HASTY_BOOST_RATIO;
    return true;
  }

  showBoundsOf(entity: DisplayableEntity) {
    if (!this.shouldShowInfo) {
      return;
    }
    this.debugInfo.addBoundsOf(entity);
  }

  addComment(
      coordinates: Point = this.universe.player.coordinates,
      text: string = Debug.DEFAULT_COMMENT_TEXT,
      color: number = Debug.DEFAULT_COMMENT_COLOR,
      buffData: BuffData | null = null) {
    return this.universe.commentLoader.load(
        new CommentData(25, color, text, coordinates, buffData), true);
  }

  private applyGameState() {
    const gameState = {
      player: {
        movementStyle: 'walk',
        coordinates: HardCodedPreset['WORLD_CENTER_COORDINATES'] as Point | null,
      },
      backgroundAudio: {
        muted: false,
      },
    };
    location.hash.slice(1).split('&').forEach(param => {
      const [key, value] = param.split('=');
      switch (key) {
        case 'walk':
        case 'run':
        case 'fly':
          gameState.player.movementStyle = key;
          break;
        case 'coordinates':
          gameState.player.coordinates = new Phaser.Point(...value.split(',').map(Number));
          break;
        case 'defaultCoordinates':
          gameState.player.coordinates = null;
          break;
        case 'mute':
          gameState.backgroundAudio.muted = true;
          break;
        default:
          break;
      }
    });

    const ignored = (this as any)[gameState.player.movementStyle];

    if (gameState.player.coordinates != null) {
      this.universe.player.addToCoordinatesBy(toWorldCoordinateOffset2d(
          gameState.player.coordinates,
          this.universe.player.coordinates,
          PhysicalConstants.WORLD_SIZE));
    }

    if (gameState.backgroundAudio.muted) {
      const ignored2 = this.mute;
    }
  }

  hideBoundsOf(entity: DisplayableEntity) {
    this.debugInfo.removeBoundsOf(entity);
  }

  private async render() {
    if (!this.shouldShowInfo) {
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

    const [foregroundEngine, backgroundEngine] = this.universe.visibility['engines'];
    this.debugInfo.line(
        `Foreground updated at`, foregroundEngine['sampler']['currentCoordinates']);
    this.debugInfo.line(
        `Background updated at`, backgroundEngine['sampler']['currentCoordinates']);

    this.debugInfo.line(
        `Lightness count: ${this.systems.backgroundColorSystem.colorMixer.lightnessCounter}`);

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

class DebugInfo {
  private static readonly SPRITE_BOUNDS_COLORS = [
    'rgba(0, 0, 255, 0.2)',
    'rgba(0, 127, 127, 0.2)',
    'rgba(0, 127, 255, 0.2)',
    'rgba(0, 255, 0, 0.2)',
    'rgba(0, 255, 127, 0.2)',
    'rgba(0, 255, 255, 0.2)',
    'rgba(127, 0, 127, 0.2)',
    'rgba(127, 0, 255, 0.2)',
    'rgba(127, 127, 0, 0.2)',
    'rgba(127, 127, 255, 0.2)',
    'rgba(127, 255, 0, 0.2)',
    'rgba(127, 255, 127, 0.2)',
    'rgba(255, 0, 0, 0.2)',
    'rgba(255, 0, 127, 0.2)',
    'rgba(255, 0, 255, 0.2)',
    'rgba(255, 127, 0, 0.2)',
    'rgba(255, 127, 127, 0.2)',
    'rgba(255, 255, 0, 0.2)'];

  constructor(
      private game: Phaser.Game,
      private player: Player,
      private entitiesToShowBounds: Map<DisplayableEntity, string> = new Map(),
      private spriteBoundsColors: string[] = [...DebugInfo.SPRITE_BOUNDS_COLORS],
      private initialCoordinates: Point = player.coordinates,
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

    for (let [entity, color] of this.entitiesToShowBounds) {
      let bounds = entity.getDisplayWorldBounds();
      bounds.topLeft = Phaser.Point.subtract(bounds.topLeft, this.initialCoordinates);
      bounds.x %= PhysicalConstants.WORLD_SIZE;
      bounds.y %= PhysicalConstants.WORLD_SIZE;

      this.game.debug.rectangle(bounds, color);
    }

    this.line('Player', this.player.coordinates, '', true);
    this.line(`FPS: ${this.game.time.fps}`);
    this.line(`Render radius: ${getRenderRadius(this.game)}`);
    this.line('Camera focus', this.game.camera.position, undefined, true);

    return this;
  }

  private getHeight() {
    return this.currentY += this.lineHeight;
  }

  clear() {
    this.game.debug.reset();
  }

  addBoundsOf(entity: DisplayableEntity) {
    let color = this.spriteBoundsColors.shift() as string;
    this.entitiesToShowBounds.set(entity, color);

    this.spriteBoundsColors.push(color);
  }

  removeBoundsOf(entity: DisplayableEntity) {
    this.entitiesToShowBounds.delete(entity);
  }
}
