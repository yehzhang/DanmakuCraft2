import {Entity} from './entity';
import {EffectData} from '../effect/effect';
import {Superposed} from '../law';
import GraphicsFactory from '../render/graphics/GraphicsFactory';

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

export interface Comment extends Superposed {
  readonly size: number;
  readonly color: number;
  readonly text: string;

  measure(): Phaser.Text;
}

export class CommentEntity extends Entity implements Comment {
  private display: Phaser.Text | null;

  constructor(
      readonly size: number,
      readonly color: number,
      readonly text: string,
      coordinate: Phaser.Point,
      private graphicsFactory: GraphicsFactory) {
    super(coordinate);
    this.display = null;
  }

  decohere(parentPosition: Phaser.Point): void {
    if (this.display != null) {
      throw new Error('CommentEntity is decoherent');
    }

    let color = Phaser.Color.getWebRGB(this.color); // TODO test if works?
    this.display = this.graphicsFactory.createText(this.text, this.size, color);
    this.display.anchor.setTo(0.5);
  }

  cohere(): void {
    if (this.display == null) {
      throw new Error('CommentEntity is coherent');
    }

    this.display = null;
  }

  measure(): Phaser.Text {
    if (this.display == null) {
      throw new Error('CommentEntity is coherent');
    }

    return this.display;
  }
}
