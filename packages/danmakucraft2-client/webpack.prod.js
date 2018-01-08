const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

console.error('Bundle in production mode.');

module.exports = merge(common, {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __DEBUG__: JSON.stringify(false),
      __DEV__: JSON.stringify(false),
    }),
    new webpack.optimize.UglifyJsPlugin({
      ecma: 5,
      output: {
        comments: false,
      },
      sourceMap: true,
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
});
