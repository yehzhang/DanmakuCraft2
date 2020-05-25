const { DefinePlugin } = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.common.js');

console.error('Bundle in production mode.');

if (process.env.WEBPACK_DEV_SERVER) {
  throw new TypeError('Webpack Dev Sever should never be used in Production mode');
}

module.exports = merge(config, {
  mode: 'production',
  output: {
    filename: 'bundle.js',
  },
  // devtool: 'source-map',
  plugins: [
    new DefinePlugin({
      __DEV__: JSON.stringify(false),
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   parallel: true,
    //   toplevel: true,
    //   output: {
    //     comments: false,
    //   },
    //   sourceMap: true,
    // }),
  ],
});
