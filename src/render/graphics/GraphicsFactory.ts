import {TinyTelevisionBuildingResult} from './TinyTelevisionBuilder';
import Comment from '../../entitySystem/component/Comment';

interface GraphicsFactory {
  createTextFromComment(comment: Comment): Phaser.Text;

  createText(text: string, size: number, color: string): Phaser.Text;

  createTinyTelevision(): TinyTelevisionBuildingResult;
}

export default GraphicsFactory;
