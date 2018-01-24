const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

console.error('Bundle in development mode.');

module.exports = merge.smart(common, {
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
    }),
  ],
});
