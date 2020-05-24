const merge = require('webpack-merge');
const config = require('./webpack.common.js');
const { DefinePlugin } = require('webpack');

console.error('Bundle in development mode.');

module.exports = merge.smart(config, {
  mode: 'development',
  output: {
    publicPath: config.devServer.public,
  },
  devtool: 'eval-source-map',
  plugins: [
    new DefinePlugin({
      __DEV__: JSON.stringify(true),
    }),
  ],
  resolve: {
    alias: {
      // Make Why Did You Render work.
      'react-redux': 'react-redux/lib',
    },
  },
});
