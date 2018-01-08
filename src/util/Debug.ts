import Universe from '../Universe';
import Colors from '../render/Colors';
import CommentData from '../comment/CommentData';
import {BuffData, BuffType} from '../entitySystem/system/buff/BuffFactory';
import ChestBuilder from '../render/graphics/ChestBuilder';
import SpeechBubbleBuilder from '../render/graphics/SpeechBubbleBuilder';
import Point from './syntax/Point';
import PhysicalConstants from '../PhysicalConstants';
import {toWorldCoordinateOffset2d} from '../law/space';
import {asSequence} from 'sequency';
import Distance from './math/Distance';
import UpdatingBuffCarrier from '../entitySystem/component/UpdatingBuffCarrier';
import {NotificationPriority} from '../render/notification/Notifier';

class Debug {
  private static readonly DEFAULT_COMMENT_TEXT = '测试弹幕';
  private static readonly DEFAULT_COMMENT_COLOR = Colors.WHITE_NUMBER;

  constructor(
      private universe: Universe,
      private notificationShowCounts: number = 0,
      private debugInfo: DebugInfo = new DebugInfo(universe)) {
    universe.render = inject(this.render.bind(this), universe.render.bind(universe));
    universe.player.moveSpeedBoostRatio = 10;
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
    let debug = new this(universe);
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
      db: debug,
    });
  }

  addComment(
      coordinates: Point = this.universe.player.coordinates,
      text: string = Debug.DEFAULT_COMMENT_TEXT,
      color: number = Debug.DEFAULT_COMMENT_COLOR,
      buffData: BuffData | null = null) {
    this.createComment(coordinates, text, color, buffData);
  }

  get chest() {
    return this.universe.chestSystem['chestSpawner']['spawnAt'](
        this.universe.player.coordinates.clone().add(0, -100));
  }

  get say() {
    this.universe.notifier.send(this.getNotificationMessage());
    return this.universe.notifier;
  }

  get shout() {
    this.universe.notifier.send(this.getNotificationMessage(), NotificationPriority.SKIP);
    return this.universe.notifier;
  }

  private render() {
    this.debugInfo.start();

    asSequence(this.universe.chestsStorage.getFinder())
        .forEach(
            chest => this.debugInfo.text('Chest', chest.coordinates, chest.isOpen ? 'opened' : ''));

    asSequence([
      this.universe.commentsStorage.getFinder(),
      this.universe.updatingCommentsStorage.getFinder()])
        .flatten()
        .flatMap(region => asSequence(region.container))
        .take(5)
        .forEach(comment => this.debugInfo.text(
            'Comment',
            comment.coordinates,
            UpdatingBuffCarrier.isTypeOf(comment) ? 'updating' : ''));
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
      private universe: Universe,
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

  text(text: string, coordinates?: Point, note?: string, disableNavigation?: boolean) {
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
            this.universe.player.coordinates,
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

    this.universe.game.debug.text(text, 10, this.currentY += this.lineHeight);

    return this;
  }

  start() {
    this.currentY = 0;

    this.text('Player', this.universe.player.coordinates, '', true);
    this.text(`Render radius: ${this.universe['getRenderRadius']()}`);

    return this;
  }
}
