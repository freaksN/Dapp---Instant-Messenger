const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
 mode: 'production',
 entry: {
    app: './src/index.js'
  },
  // for better performance
  devtool: 'source-map',
  devServer: {
    inline: true,
    host: '0.0.0.0',
    contentBase: path.join(__dirname, './dist'),
    open: true,
    progress: true,
    port: 9000,
    historyApiFallback: true
  },
  module: {
    rules: [
        {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: ['babel-loader']
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.html$/,
            use: ['html-loader']
        },
        {
            test: /\.(png|jpe?g|gif)$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]'
                    }
                }
            ]
        }
    ]
 },
 plugins: [
  new HTMLWebpackPlugin({
      title: 'UF-IM-App',
      template: './index.html',
      filename: 'index.html'
  }),
 ],
 output: {
  filename: '[name].bundle.js',
  path: path.join(__dirname, 'dist'),
  publicPath: '/',
  libraryTarget: 'var',
  library: 'EntryPoint'
 }
}