import {Region} from '../../entitySystem/alias';
import Entity from '../../entitySystem/Entity';
import VisibilitySystem from '../../entitySystem/system/visibility/VisibilitySystem';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import VisibilityEngine from './VisibilityEngine';
import VisibilityEngineBuilder from './VisibilityEngineBuilder';

export class OnOrBuildClause {
  constructor(protected readonly builder: VisibilityEngineBuilder) {
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
  constructor(
      protected readonly builder: VisibilityEngineBuilder,
      protected readonly isOnUpdate: boolean) {
  }

  apply<T>(system: VisibilitySystem<T>): ToClause<T> {
    return new ToClause(this.builder, system, this.isOnUpdate);
  }
}

class ToClause<T> {
  constructor(
      private readonly builder: VisibilityEngineBuilder,
      private readonly system: VisibilitySystem<T>,
      private readonly isOnUpdate: boolean) {
  }

  toChildren(): OfClause<Region<T>, T> {
    const systemLifter = new SystemLifter(this.system, this.system);
    return this.createOfClause(systemLifter.lifted());
  }

  toEntities(): OfClause<T, T> {
    const systemLifter = new SystemLifter(this.system, this.system);
    return this.createOfClause(systemLifter);
  }

  protected createOfClause<V, W>(systemLifter: SystemLifter<V, W>) {
    return new OfClause(this.builder, systemLifter, this.isOnUpdate);
  }
}

class OfClause<T, U> {
  constructor(
      private readonly builder: VisibilityEngineBuilder,
      private readonly systemLifter: SystemLifter<T, U>,
      private readonly isOnUpdate: boolean) {
  }

  of<V extends T & Entity>(entityFinder: EntityFinder<V>): ApplyOrToOrOfOrBuildClause<T, U> {
    this.builder.apply(this.systemLifter.get(), entityFinder, this.isOnUpdate);
    return new ApplyOrToOrOfOrBuildClause(this.builder, this.systemLifter, this.isOnUpdate);
  }
}

class ApplyOrToOrOfOrBuildClause<T, U> extends ApplyClause {
  constructor(
      builder: VisibilityEngineBuilder,
      private readonly systemLifter: SystemLifter<T, U>,
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
    this.builder.apply(this.systemLifter.get(), entityFinder, this.isOnUpdate);
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
  constructor(private readonly system: VisibilitySystem<T>) {
  }

  enter(container: Region<T>) {
    for (const entity of container) {
      this.system.enter(entity);
    }
  }

  update(container: Region<T>, time: Phaser.Time) {
    for (const entity of container) {
      this.system.update(entity, time);
    }
  }

  exit(container: Region<T>) {
    for (const entity of container) {
      this.system.exit(entity);
    }
  }

  finish() {
    this.system.finish();
  }
}

class SystemLifter<T, U> {
  constructor(
      private readonly liftedSystem: VisibilitySystem<T>,
      private readonly originalSystem: VisibilitySystem<U>) {
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
