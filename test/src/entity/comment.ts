import {CommentEntity} from '../../../src/entity/comment';
import GraphicsFactory from '../../../src/render/graphics/GraphicsFactory';
import {anything, instance, mock, when} from 'ts-mockito';
import {generateSuperposedEntityTests} from '../generator';

describe('CommentEntity', () => {
  let mockGraphicsFactory = mock(GraphicsFactory);
  when(mockGraphicsFactory.createText(anything(), anything(), anything()))
      .thenReturn(new PIXI.Sprite(null as any) as Phaser.Text);

  function createCommentEntity(coordinate: Phaser.Point) {
    return new CommentEntity(25, 0, 'Test', coordinate, instance(mockGraphicsFactory));
  }

  generateSuperposedEntityTests(createCommentEntity);
});
