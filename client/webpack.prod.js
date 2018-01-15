const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

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
  ]
});
