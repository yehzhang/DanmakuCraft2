import GameContainerProvider from '../../interface/GameContainerProvider';
import ConfigProvider from '../../config/ConfigProvider';

class OfficialGameContainerProvider implements GameContainerProvider {
  getContainerId() {
    return ConfigProvider.get().gameContainerId;
  }
}

export default OfficialGameContainerProvider;
