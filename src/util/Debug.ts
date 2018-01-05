import Universe from '../Universe';
import Colors from '../render/Colors';
import CommentData from '../comment/CommentData';
import {BuffData, BuffType} from '../entitySystem/system/buff/BuffFactory';
import ChestBuilder from '../render/graphics/ChestBuilder';
import SpeechBubbleBuilder from '../render/graphics/SpeechBubbleBuilder';
import Point from './syntax/Point';

class Debug {
  private static readonly DEFAULT_COMMENT_TEXT = '测试弹幕';
  private static readonly DEFAULT_COMMENT_COLOR = Colors.WHITE_NUMBER;

  constructor(private universe: Universe, private notificationShowCounts: number = 0) {
  }

  get comment() {
    return this.createComment(Debug.DEFAULT_COMMENT_TEXT, Debug.DEFAULT_COMMENT_COLOR, null);
  }

  get chromatic() {
    return this.createComment(
        Debug.DEFAULT_COMMENT_TEXT,
        Colors.WHITE_NUMBER,
        new BuffData(BuffType.CHROMATIC));
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
    this.universe.notifier.send(this.getNotificationMessage(), true);
    return this.universe.notifier;
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
      db: debug,
    });
  }

  private getNotificationMessage() {
    let message = `测试${this.notificationShowCounts++}`;
    message += message;
    message += message;
    message += message;
    message += message;
    return message;
  }

  private createComment(text: string, color: number, buffData: BuffData | null) {
    return this.universe.commentLoader.load(new CommentData(
        25,
        color,
        text,
        this.universe.player.coordinates.x,
        this.universe.player.coordinates.y,
        buffData));
  }
}

export default Debug;
