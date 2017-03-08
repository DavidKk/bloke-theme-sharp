import _                    from 'lodash';
import fs                   from 'fs-extra';
import path                 from 'path';
import webpack              from 'webpack';
import ExtractTextPlugin    from 'extract-text-webpack-plugin';
import CopyWebpackPlugin    from 'copy-webpack-plugin';
import HTMLWebpackPlugin    from 'html-webpack-plugin';
import HTMLWebpackPugPlugin from 'html-webpack-pug-plugin';
import CleanWebpackPlugin   from 'clean-webpack-plugin';
import autoprefixer         from 'autoprefixer';
import * as VARS            from './variables';

let entry = {
  index: path.join(VARS.RESOURCE_PATH, './scripts/index.js'),
};

let nodeModulesFolder = path.join(VARS.ROOT_PATH, './node_modules');
let resolveModules    = [
  nodeModulesFolder,
  path.join(VARS.RESOURCE_PATH, './scripts/'),
  path.join(VARS.RESOURCE_PATH, './styles/'),
];

let pugFolder  = path.join(VARS.RESOURCE_PATH, './templates');
let PugPlugins = _.map(fs.readdirSync(pugFolder), function (filename) {
  let filetype = path.extname(filename).substr(1);
  let template = path.join(pugFolder, filename);

  if (-1 === _.indexOf(['pug', 'slim', 'haml'], filetype)) {
    return;
  }

  if (fs.statSync(template).isDirectory()) {
    return;
  }

  return new HTMLWebpackPlugin({ template, filename, filetype });
});

PugPlugins = _.filter(PugPlugins);

let plugins = PugPlugins.concat([
  /**
   * Extract style file
   * Inline styles can be externally optimized for loading
   */
  new ExtractTextPlugin({
    filename  : 'styles/[name].[contenthash].css',
    allChunks : true,
  }),

  /**
   * Copy files
   */
  new CopyWebpackPlugin([
    {
      from : path.join(VARS.RESOURCE_PATH, './templates/partials'),
      to   : path.join(VARS.DISTRICT_PATH, './partials'),
    }
  ]),

  /**
   * Clean generate folders
   * run it first to reset the project.
   */
  new CleanWebpackPlugin([VARS.DISTRICT_PATH], {
    root    : VARS.ROOT_PATH,
    verbose : true,
    dry     : false,
  }),

  new HTMLWebpackPugPlugin(),
]);

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
        {
          loader  : 'postcss-loader',
          options : {
            plugins: [
              autoprefixer({
                browsers: [
                  'last 10 version',
                  'ie >= 9',
                ],
              }),
            ],
          },
        },
      ],
    }),
  },
  {
    test    : /\.js$/,
    enforce : 'pre',
    exclude : [/node_modules/],
    loader  : 'eslint-loader',
    options : {
      configFile: path.join(VARS.ROOT_PATH, '.eslintrc'),
    },
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
  /**
   * 少于 10K 图片用 base64
   * url-loader 依赖 file-loader
   */
  {
    test : /\.(jpe?g|png|gif)$/i,
    use  : [
      {
        loader  : 'url-loader',
        options : {
          limit : 10000,
          name  : 'panels/[name].[hash].[ext]',
        },
      },
    ],
  },
];

export default {
  entry  : entry,
  output : {
    path       : VARS.DISTRICT_PATH,
    publicPath : '/',
    filename   : '[name].js',
  },
  module: {
    rules: rules,
  },
  resolve: {
    modules: resolveModules,
  },
  resolveLoader: {
    modules: [nodeModulesFolder],
  },
  plugins,
};
