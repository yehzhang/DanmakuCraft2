const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

console.error('Bundle in staging mode.');

module.exports = merge(common, {
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      __DEBUG__: JSON.stringify(true),
      __DEV__: JSON.stringify(false),
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
});
