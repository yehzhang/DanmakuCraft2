export default class Texts {
  private static TEXTS: { [textName: string]: string } = {
    'boot.ui.loading': '加载中',
    'boot.ui.title': '弹幕世界',
    'boot.ui.tutorial': 'TODO',
  };

  static forName(name: string): string {
    let text = this.TEXTS[name];

    if (text == null) {
      throw new Error(`Text '${name}' not found`);
    }

    return text;
  }
}
