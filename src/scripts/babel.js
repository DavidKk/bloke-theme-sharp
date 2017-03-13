import _                 from 'lodash';
import fs                from 'fs-extra';
import path              from 'path';
import async             from 'async';
import { transformFile } from 'babel-core';

export function transformFolder (folder, output, options, callback) {
  if (4 > arguments.length) {
    return transformFolder(folder, output, {}, options);
  }

  if (!fs.statSync(folder).isDirectory()) {
    return;
  }

  let files = fs.readdirSync(folder);
  let tasks = _.map(files, function (filename) {
    let file = path.join(folder, filename);

    return function (callback) {
      if (fs.statSync(file).isDirectory()) {
        transformFolder(file, path.join(output, filename), options, callback);
      }
      else {
        if ('.js' !== path.extname(file)) {
          return callback(null, null);
        }

        transform(file, path.join(output, filename), options, callback);
      }
    };
  });

  tasks = _.filter(tasks);

  async.parallel(tasks, function (error, stats) {
    stats = _.flattenDeep(stats);
    stats = _.filter(stats);

    callback(error, stats);
  });
}

export function transform (file, output, options, callback) {
  if (4 > arguments.length) {
    return transform(file, output, {}, options);
  }

  if (!_.isFunction(callback)) {
    throw new Error('callback is not provided');
  }

  options = _.defaultsDeep(options, {
    presets: [
      require.resolve('babel-preset-es2015'),
      require.resolve('babel-preset-stage-0'),
    ],
  });

  transformFile(file, options, function (error, result) {
    if (error) {
      callback(error);
      return;
    }

    let { code } = result;
    fs.ensureDirSync(path.dirname(output));

    fs.writeFile(output, code, function () {
      if (error) {
        callback(error);
        return;
      }

      callback(null, {
        file : output,
        size : code.length,
      });
    });
  });
}
