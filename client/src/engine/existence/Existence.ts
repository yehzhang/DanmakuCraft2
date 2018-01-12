import Universe from '../../Universe';
import ExistenceEngine from './ExistenceEngine';
import RegionChildrenPositioningSystem from '../../entitySystem/system/existence/RegionChildrenPositioningSystem';
import SystemEnginesEngine from '../SystemEnginesEngine';
import CacheAsBitmapSystem from '../../entitySystem/system/existence/CacheAsBitmapSystem';

class Existence extends SystemEnginesEngine<ExistenceEngine> {
  static on(universe: Universe) {
    let commentsFinder = universe.commentsStorage.getFinder();
    let updatingCommentsFinder = universe.updatingCommentsStorage.getFinder();
    let chestsFinder = universe.chestsStorage.getFinder();
    let playersFinder = universe.playersStorage.getFinder();

    let existenceEngine = ExistenceEngine.newBuilder().onRender()
        .apply(new RegionChildrenPositioningSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        // Cannot cache region as some comments on the bounds are truncated
        .apply(new CacheAsBitmapSystem())
        .toEntities().of(chestsFinder).and(playersFinder)

        .build();

    return new this([existenceEngine]);
  }
}

export default Existence;
