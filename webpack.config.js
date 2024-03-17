const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development', // Use 'production' for production builds
  stats: {
    children: true, // Provides detailed information about child compilations
  },
  context: path.join(__dirname, 'src'),
  entry: './bootstrapper',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'wowser-[contenthash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [path.join(__dirname, 'node_modules')],
    fallback: { "stream": require.resolve("stream-browserify"), "buffer": require.resolve("buffer/"), "process": require.resolve("process/browser") }
  },
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource'
      },
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
        //exclude: /node_modules/
      },
      {
        test: /\.(frag|vert|glsl)$/,
        use: [
          'raw-loader',
          {
            loader: 'glslify-loader',
            options: { transform: ['glslify-import'] }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules|blizzardry/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      inject: true,
      template: 'index.html'
    }),
    new ESLintPlugin({
      exclude: ['node_modules', 'blizzardry'],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser', // Polyfill for process
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    proxy: {
      '/pipeline/*': {
        target: 'http://localhost:3000',
        secure: false
      }
    }
  }
};
