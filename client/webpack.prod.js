const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

const PACKAGE_DIR = require('app-root-path').toString();

console.error('Bundle in production mode.');

module.exports = merge(common, {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(false),
    }),
    new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      toplevel: true,
      output: {
        comments: false,
      },
      sourceMap: true,
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(PACKAGE_DIR, 'build/prod'),
  },
});
