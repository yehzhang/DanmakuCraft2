import ExistenceEngine from './ExistenceEngine';
import AddChildToRegionSystem from '../../entitySystem/system/existence/AddChildToRegionSystem';
import SystemEnginesEngine from '../SystemEnginesEngine';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import {CommentEntity, Region, UpdatingCommentEntity} from '../../entitySystem/alias';
import TweenBlinkingSystem from '../../entitySystem/system/existence/TweenBlinkingSystem';
import IncrementRegisteredTimesSystem from '../../entitySystem/system/existence/IncrementRegisteredTimesSystem';

class Existence extends SystemEnginesEngine<ExistenceEngine> {
  static on(
      game: Phaser.Game,
      commentsFinder: EntityFinder<Region<CommentEntity>>,
      updatingCommentsFinder: EntityFinder<Region<UpdatingCommentEntity>>) {
    let existenceEngineBuilder = ExistenceEngine.newBuilder();
    existenceEngineBuilder.onUpdate()
        .apply(new IncrementRegisteredTimesSystem())
        .toChildren().of(commentsFinder).and(updatingCommentsFinder);

    existenceEngineBuilder.onRender()
        .apply(new AddChildToRegionSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .apply(new TweenBlinkingSystem(game))
        .toChildren().of(commentsFinder).and(updatingCommentsFinder)

        .build();

    return new this([existenceEngineBuilder.build()]);
  }
}

export default Existence;
