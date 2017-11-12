import {Entity, PlayerEntity} from './entity';

export class EntityBuffManager<E extends Entity> {
  private activatedBuffs: Array<Buff<E>>;

  constructor(private readonly entity: E) {
    this.activatedBuffs = [];
  }

  activate(buff: Buff<E>) {
    buff.initialize(this.entity);
    this.activatedBuffs.push(buff);
  }

  tick() {
    this.activatedBuffs = this.activatedBuffs.filter(buff => {
      buff.tick();

      if (buff.isExpired()) {
        buff.reset(this.entity);
        return false;
      } else {
        buff.update(this.entity);
        return true;
      }
    });
  }
}

export abstract class Buff<E extends Entity = PlayerEntity> {
  private ticks: number;

  constructor(private readonly lifetime: number) {
    this.ticks = 0;
  }

  tick() {
    this.ticks++;
  }

  isExpired() {
    return this.ticks >= this.lifetime;
  }

  abstract initialize(entity: E);

  abstract update(entity: E);

  abstract reset(entity: E);
}
