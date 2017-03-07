import _             from 'lodash';
import webpack       from 'webpack';
import WebpackMerger from 'webpack-merge';
import webpackConfig from './webpack.common.config.babel';

const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

export default WebpackMerger(webpackConfig, {
  output: {
    filename   : '[name].[chunkhash].js',
    publicPath : '/',
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap : false,
      mangle    : false,
      compress  : {
        warnings: false,
      },
      output: {
        comments: false
      },
    }),
  ],
});
