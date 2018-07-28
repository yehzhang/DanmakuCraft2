import {CommentEntity, UpdatingCommentEntity} from '../../entitySystem/alias';
import IncrementRegisteredTimesSystem from '../../entitySystem/system/existence/IncrementRegisteredTimesSystem';
import TweenBlinkingSystem from '../../entitySystem/system/existence/TweenBlinkingSystem';
import EntityFinder from '../../util/entityStorage/EntityFinder';
import SystemEnginesEngine from '../SystemEnginesEngine';
import ExistenceEngine from './ExistenceEngine';

class Existence extends SystemEnginesEngine<ExistenceEngine> {
  static on(
      game: Phaser.Game,
      commentsFinder: EntityFinder<CommentEntity>,
      updatingCommentsFinder: EntityFinder<UpdatingCommentEntity>) {
    const existenceEngineBuilder = ExistenceEngine.newBuilder();
    existenceEngineBuilder.onUpdate()
        .apply(new IncrementRegisteredTimesSystem())
        .toEntities().of(commentsFinder).and(updatingCommentsFinder);

    existenceEngineBuilder.onRender()
        .apply(new TweenBlinkingSystem(game))
        .toEntities().of(commentsFinder).and(updatingCommentsFinder)

        .build();

    return new this([existenceEngineBuilder.build()]);
  }
}

export default Existence;
