class Texts {
  private static TEXTS: { [textName: string]: string } = {
    'boot.anyInput': '按任意键开始游戏',
    'boot.done': '加载完毕',
    'boot.error': '加载失败，请刷新页面',
    'boot.loading': '加载中',
    'boot.title': '弹幕世界2',

    'main.tutorial.move': '按 W、S、A、D 移动',
    'main.tutorial.comment': '按回车键开始输入弹幕，再次按下发送弹幕',

    'main.buff.description.none': '我捡到了……一团空气',
    'main.buff.description.chromatic': '下一条弹幕一定会很绚丽',
    'main.buff.description.hasty': '现在我健步如飞了！',

    'main.comment.insert.collision': '这里塞不下更多弹幕了哟',
  };

  static forName(name: string): string {
    let text = this.TEXTS[name];

    if (text == null) {
      throw new Error(`Text '${name}' not found`);
    }

    return text;
  }
}

export default Texts;
