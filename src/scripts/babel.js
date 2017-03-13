import _                 from 'lodash';
import fs                from 'fs-extra';
import path              from 'path';
import async             from 'async';
import { transformFile } from 'babel-core';

export function transformFolder (folder, output, callback) {
  if (!fs.statSync(folder).isDirectory()) {
    return;
  }

  let files = fs.readdirSync(folder);
  let tasks = _.map(files, function (filename) {
    let file = path.join(folder, filename);

    return function (callback) {
      if (fs.statSync(file).isDirectory()) {
        transformFolder(file, path.join(output, filename), callback);
      }
      else {
        if ('.js' !== path.extname(file)) {
          return callback(null, null);
        }

        transform(file, path.join(output, filename), callback);
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

export function transform (file, output, callback) {
  if (!_.isFunction(callback)) {
    throw new Error('callback is not provided');
  }

  transformFile(file, {
    plugins: [
      require.resolve('babel-plugin-transform-es2015-modules-amd'),
    ],
    presets: [
      require.resolve('babel-preset-es2015'),
      require.resolve('babel-preset-stage-0'),
    ],
  },
  function (error, result) {
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
