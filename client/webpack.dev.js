const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

console.error('Bundle in development mode.');

module.exports = merge.smart(common, {
  devtool: 'cheap-module-eval-source-map',
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
});
