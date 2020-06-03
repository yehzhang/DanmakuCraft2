const TerserPlugin = require('terser-webpack-plugin');
const { DefinePlugin } = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.common.js');

console.error('Bundle in production mode.');

module.exports = merge(config, {
  mode: 'production',
  output: {
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  plugins: [
    new DefinePlugin({
      __DEV__: JSON.stringify(false),
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
});
