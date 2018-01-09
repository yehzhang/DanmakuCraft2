const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const PACKAGE_DIR = require('app-root-path').toString();

console.error('Bundle in production mode.');

module.exports = merge(common, {
  plugins: [
    new webpack.DefinePlugin({
      __STAGE__: JSON.stringify(false),
      __DEV__: JSON.stringify(false),
    }),
    new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      toplevel: true,
      output: {
        comments: false,
      },
    }),
  ],
  output: {
    path: path.join(PACKAGE_DIR, 'dist'),
  },
});
