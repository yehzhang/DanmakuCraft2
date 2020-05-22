import Parse from 'parse';

function initialize() {
  Parse.initialize(
    'web9nefde1uMML5m3SUhQwDGbTPMP9vIn0OtALyn',
    '5Zfjq6zZHrIDR8scvgdebjqTMdbKVDWjzK695Ycm'
  );
  Parse.serverURL = 'https://danmakucraft2.back4app.io/';
}

export default initialize;
