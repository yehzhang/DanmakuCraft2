import {Observer} from '../entity/entity';
import EntityProjector from '../update/EntityProjector';

export default class RenderingTarget {
  constructor(
      readonly observer: Observer,
      readonly projector: EntityProjector,
      readonly zIndex: number) {
  }
}
