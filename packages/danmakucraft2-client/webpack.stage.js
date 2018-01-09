const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

console.error('Bundle in staging mode.');

module.exports = merge(common, {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __STAGE__: JSON.stringify(true),
      __DEV__: JSON.stringify(false),
    }),
    new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      mangle: false,
      compress: false,
      output: {
        beautify: true,
        comments: false,
        indent_level: 2,
      },
      sourceMap: true,
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
});
