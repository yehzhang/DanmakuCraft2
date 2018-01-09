const path = require('path');
const webpack = require('webpack');

const PACKAGE_DIR = require('app-root-path').toString();
const SRC_DIR = path.resolve(__dirname, 'src');
const PHASER_DIR = path.join(PACKAGE_DIR, 'node_modules/phaser-ce-type-updated');

module.exports = {
  entry: `${SRC_DIR}/index.ts`,
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
  plugins: [
    new webpack.DefinePlugin({
      __WEBPACK__: JSON.stringify(true),
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [SRC_DIR, 'node_modules'],
    alias: {
      constants: `${SRC_DIR}/constants`,
      phaser: path.join(PHASER_DIR, 'build/custom/phaser-split.js'),
      pixi: path.join(PHASER_DIR, 'build/custom/pixi.js'),
      p2: path.join(PHASER_DIR, 'build/custom/p2.js'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.join(PACKAGE_DIR, 'build'),
  },
};
