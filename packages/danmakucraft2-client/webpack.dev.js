const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

console.error('Bundle in development mode.');

// TODO expose all typescript modules
module.exports = merge.smart(common, {
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      __STAGE__: JSON.stringify(true),
      __DEV__: JSON.stringify(true),
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
});
