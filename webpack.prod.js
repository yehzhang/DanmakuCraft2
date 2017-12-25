const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

console.error('Bundle in production mode.');

module.exports = merge(common, {
  plugins: [
    new webpack.DefinePlugin({
      __DEBUG__: JSON.stringify(false),
    }),
    new webpack.optimize.UglifyJsPlugin({
      ecma: 5,
      output: {
        comments: false,
      },
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
});
