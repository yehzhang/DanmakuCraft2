const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const sourcePath = path.resolve(__dirname, 'src');
const outPath = path.resolve(__dirname, '../build');
const backendPublicPath = path.resolve(__dirname, '../website/public');

const analysis = !!process.env.ANALYSIS;

module.exports = {
  entry: path.join(sourcePath, 'index.tsx'),
  output: {
    path: outPath,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: 'raw-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['bundle.js'],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: analysis ? 'server' : 'disabled',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: [sourcePath, 'node_modules'],
  },
  devServer: {
    public: 'https://192.168.29.101:8080/',
    // Listen for requests from the network.
    host: '0.0.0.0',
    open: false,
    contentBase: [__dirname, outPath, backendPublicPath],
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
