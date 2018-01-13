import ExistenceEngine from './ExistenceEngine';
import RegionChildrenPositioningSystem from '../../entitySystem/system/existence/RegionChildrenPositioningSystem';
import SystemEnginesEngine from '../SystemEnginesEngine';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import {CommentEntity, Region, UpdatingCommentEntity} from '../../entitySystem/alias';

class Existence extends SystemEnginesEngine<ExistenceEngine> {
  static on(
      commentsFinder: EntityFinder<Region<CommentEntity>>,
      updatingCommentsFinder: EntityFinder<Region<UpdatingCommentEntity>>) {
    let existenceEngine = ExistenceEngine.newBuilder().onRender()
        .apply(new RegionChildrenPositioningSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .build();

    return new this([existenceEngine]);
  }
}

export default Existence;
