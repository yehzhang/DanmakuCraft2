import Universe from '../../Universe';
import ExistenceEngine from './ExistenceEngine';
import RegionChildrenPositioningSystem from '../../entitySystem/system/existence/RegionChildrenPositioningSystem';
import SystemEnginesEngine from '../SystemEnginesEngine';

class Existence extends SystemEnginesEngine<ExistenceEngine> {
  static on(universe: Universe) {
    let commentsFinder = universe.commentsStorage.getFinder();
    let updatingCommentsFinder = universe.updatingCommentsStorage.getFinder();

    let existenceEngine = ExistenceEngine.newBuilder().onRender()
        .apply(new RegionChildrenPositioningSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .build();

    return new this([existenceEngine]);
  }
}

export default Existence;
