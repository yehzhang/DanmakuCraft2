const path = require('path');
const { DefinePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const sourcePath = path.resolve(__dirname, 'src');
const outPath = path.resolve(__dirname, '../build');
const backendAssetsPath = path.resolve(__dirname, '../server/assets');

const localBackend = !!process.env.LOCAL_BACKEND;
const analysis = !!process.env.ANALYSIS;

module.exports = {
  entry: path.join(sourcePath, 'index.tsx'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DefinePlugin({
      __LOCAL_BACKEND__: JSON.stringify(localBackend),
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: analysis ? 'server' : 'disabled',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: [sourcePath, 'node_modules'],
  },
  output: {
    path: outPath,
  },
  devServer: {
    public: 'https://localhost:8080',
    open: false,
    contentBase: [__dirname, outPath, backendAssetsPath],
    https: true,
    // Workaround the Socket JS error when serving to HTTPS websites.
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.bilibili.com',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, x-id, Content-Length, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET',
    },
  },
};
