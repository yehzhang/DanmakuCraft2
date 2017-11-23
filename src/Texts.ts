export default class Texts {
  private static TEXTS: { [textName: string]: string } = {
    'boot.anyInput': '按任意键开始游戏',
    'boot.done': '加载完毕',
    'boot.error': '加载失败，请刷新页面',
    'boot.loading': '加载中',
    'boot.title': '弹幕世界',

    'main.tutorial.move': '按 W、S、A、D 移动',
    'main.tutorial.comment': '按回车键开始输入弹幕，再次按下发送弹幕',
  };

  static forName(name: string): string {
    let text = this.TEXTS[name];

    if (text == null) {
      throw new Error(`Text '${name}' not found`);
    }

    return text;
  }
}
