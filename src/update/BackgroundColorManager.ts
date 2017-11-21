import EntityManager, {Region} from '../entity/EntityManager';
import {CommentEntity} from '../entity/comment';
import EntityTrackerListener from './entityTracker/RegionChangeListener';
import {AnimatedEntity} from '../entity/entity';

export default class BackgroundColorManager
    extends EntityTrackerListener<AnimatedEntity, CommentEntity> {
  private colorTween: Phaser.Tween | null;
  private colorMixer: ColorMixer;

  constructor(private game: Phaser.Game) {
    super();
    this.colorTween = null;
    this.colorMixer = new ColorMixer();
  }

  onEnter(
      entityManager: EntityManager<CommentEntity>,
      trackee: AnimatedEntity,
      regions: Array<Region<CommentEntity>>): void {
    for (let region of regions) {
      region.forEach(commentEntity => {
        let color = commentEntity.color;
        this.colorMixer.add(color);
      });
    }
  }

  onExit(
      entityManager: EntityManager<CommentEntity>,
      trackee: AnimatedEntity,
      regions: Array<Region<CommentEntity>>): void {
    for (let region of regions) {
      region.forEach(commentEntity => {
        let color = commentEntity.color;
        this.colorMixer.remove(color);
      });
    }
  }

  onUpdate(entityManager: EntityManager<CommentEntity>, trackee: AnimatedEntity) {
    if (this.colorTween) {
      this.colorTween.stop();
    }

    let backgroundColor = this.colorMixer.getMixedColor();
    this.colorTween = this.buildBackgroundColorTween(backgroundColor);
    this.colorTween.start();
  }

  private buildBackgroundColorTween(targetColor: number): Phaser.Tween {
    // Tweens the color in RGB.
    let currColorObj = Phaser.Color.getRGB(this.game.stage.backgroundColor);
    let targetColorObj = Phaser.Color.getRGB(targetColor);
    let colorTween = this.game.add.tween(currColorObj).to(targetColorObj);

    colorTween.onUpdateCallback(() => {
      let currColor = Phaser.Color.getColor(currColorObj.r, currColorObj.g, currColorObj.b);
      this.game.stage.backgroundColor = currColor;
    });

    return colorTween;
  }
}

class ColorMixer {
  private counter: Map<number, number>;
  private count: number;

  constructor() {
    this.counter = new Map();
    this.count = 0;
  }

  add(color: number) {
    let colorCount = this.counter.get(color) || 0;
    this.counter.set(color, colorCount + 1);

    this.count++;
  }

  remove(color: number) {
    let colorCount = this.counter.get(color);

    if (colorCount === undefined) {
      console.error(`Color does not exists: ${color}`);
      return;
    }

    colorCount--;
    if (colorCount === 0) {
      this.counter.delete(color);
    } else {
      this.counter.set(color, colorCount);
    }

    this.count--;
  }

  getMixedColor(): number {
    let mostFrequentColor = 0;
    let mostFrequentCount = 0;
    this.counter.forEach((count, color) => {
      if (count > mostFrequentColor) {
        mostFrequentColor = color;
        mostFrequentCount = count;
      }
    });



    return Phaser.Color.getColor(color.r, color.g, color.b);
  }
}
