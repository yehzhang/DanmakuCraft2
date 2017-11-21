import {SuperposedEntity} from './entity';
import {EffectData, EffectFactory} from '../effect';
import SettingsManager from '../environment/SettingsManager';
import CommentProvider, {NewCommentEvent} from '../environment/CommentProvider';
import {UnaryEvent} from '../dispatcher';
import EntityManager from './EntityManager';

export class CommentData {
  constructor(
      readonly size: number,
      readonly color: number,
      readonly sendTime: number,
      readonly userId: number,
      readonly text: string,
      readonly coordinateX: number, // These positions may be invalid.
      readonly coordinateY: number,
      readonly effectData: EffectData | null) {
  }
}

export class CommentManager {
  private fontFamily: string;

  constructor(
      private game: Phaser.Game,
      private entityManager: EntityManager,
      settingsManager: SettingsManager) {
    this.fontFamily = settingsManager.getSetting(SettingsManager.Options.FONT_FAMILY);
    settingsManager.addEventListener(
        SettingsManager.Options.FONT_FAMILY, this.onFontChanged.bind(this));
  }

  private onFontChanged(event: UnaryEvent<string>) {
    let fontFamily = event.getDetail();
    if (this.fontFamily === fontFamily) {
      return;
    }

    this.fontFamily = fontFamily;

    // TODO redraw all sprites?
  }

  loadBatch(commentsData: CommentData[]) {
    let comments = commentsData.map(CommentManager.buildEntity);
    this.entityManager.loadBatch(comments);
    return comments;
  }

  load(commentData: CommentData) {
    let comment = CommentManager.buildEntity(commentData);
    this.entityManager.load(comment);
    return comment;
  }

  private static buildEntity(data: CommentData) {
    let coordinate = new Phaser.Point(data.coordinateX, data.coordinateY);
    let comment = new CommentEntity(data.size, data.color, data.text, coordinate);

    if (data.effectData != null) {
      let effect = EffectFactory.build(data.effectData);
      effect.initialize(comment);
    }

    return comment;
  }

  addSprite(text: string, size: number, color: string, group: Phaser.Group): Phaser.Sprite {
    // TODO add font shadow
    return this.game.add.text(
        0,
        0,
        text,
        {
          font: this.fontFamily,
          fontSize: size,
          fill: color,
        },
        group);
  }

  canPlace(text: string, size: number): boolean {
    // TODO
    throw new Error('Not implemented');
  }

  listenOn(commentProvider: CommentProvider) {
    commentProvider.addEventListener(CommentProvider.NEW_COMMENT, this.onNewComment.bind(this));
  }

  private onNewComment(event: NewCommentEvent) {
    let commentData = event.getDetail();
    this.load(commentData);
  }
}

export interface Comment {
  readonly size: number;
  readonly color: number;
  readonly text: string;
}

export class CommentEntity extends SuperposedEntity implements Comment {
  constructor(
      readonly size: number,
      readonly color: number,
      readonly text: string,
      coordinate: Phaser.Point) {
    super(coordinate);
  }

  decohere(parentCoordinate: Phaser.Point): void {
    throw new Error('Not implemented');
  }

  cohere(): void {
    throw new Error('Not implemented');
  }

  measure(): PIXI.DisplayObject {
    throw new Error('Not implemented');
  }
}
