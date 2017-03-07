import fs                from 'fs-extra';
import path              from 'path';
import webpack           from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as VARS         from './variables';

let entry = {
  index: './src/scripts/index.js'
};

let nodeModulesFolder = path.join(VARS.ROOT_PATH, './node_modules');
let resolveModules    = [
  nodeModulesFolder,
  path.join(VARS.ROOT_PATH, './src/scripts/'),
  path.join(VARS.ROOT_PATH, './src/styles/'),
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
    path       : VARS.DISTRICT_PATH,
    publicPath : '/',
    filename   : '[name].js',
  },
  resolveLoader: {
    modules: [nodeModulesFolder],
  },
  plugins: plugins,
};
