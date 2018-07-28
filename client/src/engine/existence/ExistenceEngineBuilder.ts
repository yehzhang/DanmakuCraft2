import Entity from '../../entitySystem/Entity';
import ExistenceSystem from '../../entitySystem/system/existence/ExistenceSystem';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import ExistenceEngine, {ExistenceRelation} from './ExistenceEngine';

class ExistenceEngineBuilder {
  constructor(
      private onUpdateRelations: ExistenceRelation[] = [],
      private onRenderRelations: ExistenceRelation[] = []) {
  }

  apply<T, U extends T & Entity>(
      system: ExistenceSystem<T>,
      entityFinder: EntityFinder<U>,
      isOnUpdate: boolean) {
    const relation = new ExistenceRelation(system, entityFinder);

    let relations;
    if (isOnUpdate) {
      relations = this.onUpdateRelations;
    } else {
      relations = this.onRenderRelations;
    }
    relations.push(relation);

    return this;
  }

  build() {
    return new ExistenceEngine(this.onUpdateRelations, this.onRenderRelations);
  }
}

export default ExistenceEngineBuilder;
