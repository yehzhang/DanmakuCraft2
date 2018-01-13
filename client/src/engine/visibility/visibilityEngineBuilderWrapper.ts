import VisibilitySystem from '../../entitySystem/system/visibility/VisibilitySystem';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import TickSystem from '../../entitySystem/system/tick/TickSystem';
import VisibilityEngineBuilder from './VisibilityEngineBuilder';
import {Region} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import VisibilityEngine from './VisibilityEngine';

export class OnOrBuildClause {
  constructor(protected builder: VisibilityEngineBuilder) {
  }

  onUpdate(): ApplyClause {
    return new ApplyClause(this.builder, true);
  }

  onRender(): ApplyClause {
    return new ApplyClause(this.builder, false);
  }

  build(): VisibilityEngine {
    return this.builder.build();
  }
}

class ApplyClause {
  constructor(protected builder: VisibilityEngineBuilder, protected isOnUpdate: boolean) {
  }

  applyVisibilitySystem<T>(system: VisibilitySystem<T>): ToClause<T> {
    return new ToClause(this.builder, system, this.isOnUpdate);
  }

  applyTickSystem(system: TickSystem): ApplyClause {
    this.builder.applyTickSystem(system, this.isOnUpdate);
    return this;
  }
}

class ToClause<T> {
  constructor(
      private builder: VisibilityEngineBuilder,
      private system: VisibilitySystem<T>,
      private isOnUpdate: boolean) {
  }

  toChildren(): OfClause<Region<T>, T> {
    let systemLifter = new SystemLifter(this.system, this.system);
    return this.createOfClause(systemLifter.lifted());
  }

  toEntities(): OfClause<T, T> {
    let systemLifter = new SystemLifter(this.system, this.system);
    return this.createOfClause(systemLifter);
  }

  protected createOfClause<V, W>(systemLifter: SystemLifter<V, W>) {
    return new OfClause(this.builder, systemLifter, this.isOnUpdate);
  }
}

class OfClause<T, U> {
  constructor(
      private builder: VisibilityEngineBuilder,
      private systemLifter: SystemLifter<T, U>,
      private isOnUpdate: boolean) {
  }

  of<V extends T & Entity>(entityFinder: EntityFinder<V>): ApplyOrToOrOfOrBuildClause<T, U> {
    this.builder.applyVisibilitySystem(this.systemLifter.get(), entityFinder, this.isOnUpdate);
    return new ApplyOrToOrOfOrBuildClause(this.builder, this.systemLifter, this.isOnUpdate);
  }
}

class ApplyOrToOrOfOrBuildClause<T, U> extends ApplyClause {
  constructor(
      builder: VisibilityEngineBuilder,
      private systemLifter: SystemLifter<T, U>,
      isOnUpdate: boolean) {
    super(builder, isOnUpdate);
  }

  toChildren(): OfClause<Region<U>, U> {
    return this.createOriginalToClause().toChildren();
  }

  toEntities(): OfClause<U, U> {
    return this.createOriginalToClause().toEntities();
  }

  and<V extends T & Entity>(entityFinder: EntityFinder<V>) {
    this.builder.applyVisibilitySystem(this.systemLifter.get(), entityFinder, this.isOnUpdate);
    return this;
  }

  build() {
    return this.builder.build();
  }

  private createOriginalToClause() {
    return new ToClause(this.builder, this.systemLifter.getOriginal(), this.isOnUpdate);
  }
}

class LiftVisibilitySystemSystem<T> implements VisibilitySystem<Region<T>> {
  constructor(private system: VisibilitySystem<T>) {
  }

  enter(region: Region<T>) {
    for (let entity of region.container) {
      this.system.enter(entity);
    }
  }

  update(region: Region<T>, time: Phaser.Time) {
    for (let entity of region.container) {
      this.system.update(entity, time);
    }
  }

  exit(region: Region<T>) {
    for (let entity of region.container) {
      this.system.exit(entity);
    }
  }

  finish() {
    this.system.finish();
  }
}

class SystemLifter<T, U> {
  constructor(
      private liftedSystem: VisibilitySystem<T>,
      private originalSystem: VisibilitySystem<U>) {
  }

  lifted(): SystemLifter<Region<T>, U> {
    return new SystemLifter(new LiftVisibilitySystemSystem(this.liftedSystem), this.originalSystem);
  }

  get(): VisibilitySystem<T> {
    return this.liftedSystem;
  }

  getOriginal(): VisibilitySystem<U> {
    return this.originalSystem;
  }
}
