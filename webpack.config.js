const path = require('path');
const webpack = require('webpack');

const APP_DIR = path.resolve(__dirname, 'src');
const PHASER_DIR = path.join(__dirname, '/node_modules/phaser');

module.exports = env => {
  let isProduction = env && env.production;

  let plugins = [];
  if (isProduction) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,
      },
    }));
  }

  let outputPath;
  if (isProduction) {
    outputPath = path.resolve(__dirname, 'dist');
  } else {
    outputPath = path.resolve(__dirname, 'build');
  }

  let entry;
  if (isProduction) {
    entry = './src/index.bilibili.ts';
  } else {
    entry = './src/index.testing.ts';
  }

  return {
    entry,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
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
      extensions: ['.tsx', '.ts', '.js'],
      modules: [APP_DIR, 'node_modules'],
      alias: {
        constants: `${APP_DIR}/constants`,
        phaser: path.join(PHASER_DIR, 'build/custom/phaser-split.js'),
        pixi: path.join(PHASER_DIR, 'build/custom/pixi.js'),
        p2: path.join(PHASER_DIR, 'build/custom/p2.js'),
      },
    },
    devtool: 'source-map',
    plugins,
    output: {
      filename: 'bundle.js',
      path: outputPath,
    },
  };
};
