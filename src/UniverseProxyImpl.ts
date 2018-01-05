import BuffDataContainer from './comment/BuffDataContainer';
import Colors from './render/Colors';
import GraphicsFactory from './render/graphics/GraphicsFactory';
import {Player} from './entitySystem/alias';
import UniverseProxy from './environment/interface/UniverseProxy';
import Notifier from './render/notification/Notifier';
import Texts from './render/Texts';
import CollisionDetectionSystem from './entitySystem/system/existence/CollisionDetectionSystem';

class UniverseProxyImpl implements UniverseProxy {
  constructor(
      private collisionDetectionSystem: CollisionDetectionSystem,
      private graphicsFactory: GraphicsFactory,
      private notifier: Notifier,
      private buffDataContainer: BuffDataContainer) {
  }

  requestForPlacingComment(text: string, size: number): boolean {
    let newComment = this.graphicsFactory.createText(text, size, Colors.WHITE);
    if (this.collisionDetectionSystem.collidesWith(newComment)) {
      this.notifier.send(Texts.forName('main.comment.insert.collision'));
      return false;
    }

    // TODO show shadow
    return true;
  }

  getPlayer(): Player {
    throw new Error('Method not implemented.');
  }

  getBuffDataContainer() {
    return this.buffDataContainer;
  }
}

export default UniverseProxyImpl;
