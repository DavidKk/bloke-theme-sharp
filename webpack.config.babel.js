import fs                from 'fs-extra';
import path              from 'path';
import webpack           from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

let entry = {
  index: './src/scripts/index.js'
};

let rootPath          = path.join(__dirname, './');
let nodeModulesFolder = path.join(rootPath, './node_modules');
let resolveModules    = [
  nodeModulesFolder,
  path.join(rootPath, './src/scripts/'),
  path.join(rootPath, './src/styles/'),
];

let plugins = [
  new ExtractTextPlugin({
    filename  : 'styles/[name].[contenthash].css',
    allChunks : true,
  }),
];

let rules = [
  {
    test : /\.(sass|scss)$/,
    use  : ExtractTextPlugin.extract({
      fallback : 'style-loader',
      use      : [
        {
          loader  : 'css-loader',
          options : {
            sourceMap: true,
          },
        },
        {
          loader  : 'sass-loader',
          options : {
            module       : false,
            includePaths : resolveModules,
          },
        },
      ],
    }),
  },
  {
    test : /\.js$/,
    use  : [
      {
        loader: 'babel-loader',
        options: {
          presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-stage-0'),
          ],
        },
      },
    ],
  },
];

export default {
  entry   : entry,
  devtool : 'inline-source-map',
  output  : {
    path       : path.join(rootPath, './assets'),
    publicPath : '/',
    filename   : '[name].js',
  },
  resolveLoader: {
    modules: [nodeModulesFolder],
  },
  plugins: plugins,
};
