const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  plugins: [
    // new BundleAnalyzerPlugin()
  ],
  context: path.join(__dirname, './'),
  entry: './src/index.jsx',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                "targets": {
                  "node": "current"
                }
              }],
              '@babel/preset-react'
            ],
            plugins: [
              ['babel-plugin-import', {
                libraryName: '@material-ui/icons',
                libraryDirectory: 'esm', // or '' if bundler does not support ES modules
                camel2DashComponentName: false,
              }]
            ]
          }
        }
      },
      // Tell Webpack how to transform files other than JS files
      {
        test: /.css$/,
        loader: 'style-loader!css-loader',
        include: [path.join(__dirname, 'src'), /node_modules/]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'file-loader'
      }
    ],
  },
};