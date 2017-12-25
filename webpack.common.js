const path = require('path');

const APP_DIR = path.resolve(__dirname, 'src');
const PHASER_DIR = path.join(__dirname, '/node_modules/phaser-ce-type-updated');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /pixi\.js/,
        use: [
          {
            loader: 'expose-loader',
            options: 'PIXI',
          }
        ],
      },
      {
        test: /phaser-split\.js$/,
        use: [
          {
            loader: 'expose-loader',
            options: 'Phaser',
          }
        ],
      },
      {
        test: /p2\.js/,
        use: [
          {
            loader: 'expose-loader',
            options: 'p2',
          }
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [APP_DIR, 'node_modules'],
    alias: {
      constants: `${APP_DIR}/constants`,
      phaser: path.join(PHASER_DIR, 'build/custom/phaser-split.js'),
      pixi: path.join(PHASER_DIR, 'build/custom/pixi.js'),
      p2: path.join(PHASER_DIR, 'build/custom/p2.js'),
    },
  },
};
