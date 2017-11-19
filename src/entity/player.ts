import {AnimatedEntity} from './entity';

export class PlayerManager {
  // TODO spawn player
}

export class PlayerEntity extends AnimatedEntity {
  decohere(): void {
    throw new Error('Method not implemented. Currently player is always displayed.');
  }

  cohere(): void {
    throw new Error('Method not implemented. Currently player is always displayed.');
  }

  measure(): PIXI.DisplayObject {
    throw new Error('Method not implemented.');  // TODO
  }
}