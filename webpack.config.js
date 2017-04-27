var path = require('path');
var webpack = require('webpack');
var FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin');

module.exports = {

  entry: './index.js',
  output: {
    publicPath: __dirname + '/dist/',
    path: path.join(__dirname, './dist'),
    filename: 'bapublisher.js'
  },
  devtool: "source-map",
  watchOptions: {
    poll: true
  },
  target: 'electron',
  module: {
    preLoaders: [
      {
        test: /\.jsx$|\.js$/,
        loader: 'eslint-loader',
        include: __dirname + '/src',
        exclude: /build\.js$/
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
            presets: ['es2015', 'stage-0']
        }
      },
      {
        test: /\.json?$/,
        loader: 'json-loader'
      },
    ]
  },
  plugins: [
    new FlowBabelWebpackPlugin(),
    new webpack.IgnorePlugin(/ajv/)
  ],
}