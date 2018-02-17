const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path');

const PACKAGE_DIR = require('app-root-path').toString();
const LOCAL = process.env.LOCAL_SERVER != null;

console.error('Bundle in development mode.');

module.exports = merge.smart(common, {
  devtool: LOCAL ? 'cheap-module-eval-source-map' : 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
    }),
    new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      mangle: false,
      compress: false,
      sourceMap: true,
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(PACKAGE_DIR, 'build/dev'),
  },
});
