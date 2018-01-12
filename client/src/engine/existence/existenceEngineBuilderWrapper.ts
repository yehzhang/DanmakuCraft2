import ExistenceSystem from '../../entitySystem/system/existence/ExistenceSystem';
import {Region} from '../../entitySystem/alias';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import Entity from '../../entitySystem/Entity';
import ExistenceEngineBuilder from './ExistenceEngineBuilder';
import ExistenceEngine from './ExistenceEngine';

export class OnOrBuildClause {
  constructor(protected builder: ExistenceEngineBuilder) {
  }

  onUpdate(): ApplyClause {
    return new ApplyClause(this.builder, true);
  }

  onRender(): ApplyClause {
    return new ApplyClause(this.builder, false);
  }

  build(): ExistenceEngine {
    return this.builder.build();
  }
}

class ApplyClause {
  constructor(protected builder: ExistenceEngineBuilder, protected isOnUpdate: boolean) {
  }

  apply<T>(system: ExistenceSystem<T>): ToClause<T> {
    return new ToClause(this.builder, system, this.isOnUpdate);
  }
}

class ToClause<T> {
  constructor(
      private builder: ExistenceEngineBuilder,
      private system: ExistenceSystem<T>,
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
      private builder: ExistenceEngineBuilder,
      private systemLifter: SystemLifter<T, U>,
      private isOnUpdate: boolean) {
  }

  of<V extends T & Entity>(entityFinder: EntityFinder<V>): ApplyOrToOrOfOrBuildClause<T, U> {
    this.builder.apply(this.systemLifter.get(), entityFinder, this.isOnUpdate);
    return new ApplyOrToOrOfOrBuildClause(this.builder, this.systemLifter, this.isOnUpdate);
  }
}

class ApplyOrToOrOfOrBuildClause<T, U> extends ApplyClause {
  constructor(
      builder: ExistenceEngineBuilder,
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

class LiftExistenceSystemSystem<T> implements ExistenceSystem<Region<T>> {
  constructor(private system: ExistenceSystem<T>) {
  }

  adopt(region: Region<T>) {
    for (let entity of region.container) {
      this.system.adopt(entity);
    }
  }

  abandon(region: Region<T>) {
    for (let entity of region.container) {
      this.system.abandon(entity);
    }
  }
}

class SystemLifter<T, U> {
  constructor(
      private liftedSystem: ExistenceSystem<T>,
      private originalSystem: ExistenceSystem<U>) {
  }

  lifted(): SystemLifter<Region<T>, U> {
    return new SystemLifter(new LiftExistenceSystemSystem(this.liftedSystem), this.originalSystem);
  }

  get(): ExistenceSystem<T> {
    return this.liftedSystem;
  }

  getOriginal(): ExistenceSystem<U> {
    return this.originalSystem;
  }
}
