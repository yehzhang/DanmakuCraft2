import ExistenceEngine from './ExistenceEngine';
import AddChildToRegionSystem from '../../entitySystem/system/existence/AddChildToRegionSystem';
import SystemEnginesEngine from '../SystemEnginesEngine';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import {CommentEntity, Region, UpdatingCommentEntity} from '../../entitySystem/alias';

class Existence extends SystemEnginesEngine<ExistenceEngine> {
  static on(
      commentsFinder: EntityFinder<Region<CommentEntity>>,
      updatingCommentsFinder: EntityFinder<Region<UpdatingCommentEntity>>) {
    let existenceEngine = ExistenceEngine.newBuilder().onRender()
        .apply(new AddChildToRegionSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .build();

    return new this([existenceEngine]);
  }
}

export default Existence;
