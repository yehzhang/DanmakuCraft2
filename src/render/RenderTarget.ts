import {Observer} from '../entitySystem/alias';

export default class RenderingTarget {
  constructor(
      readonly observer: Observer,
      readonly observerDisplay: PIXI.DisplayObject,
      readonly zIndex: number) {
  }
}
