const path = require('path');


module.exports = {
  mode: 'development',
  context: path.join(__dirname, './'),
  entry: './src/index.jsx',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      // Tell Webpack how to transform files other than JS files - in this case we tell it what to do with .css files.
      {
        test: /.css$/,
        loader: 'style-loader!css-loader',
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'file-loader'
      }
    ],
  },
};