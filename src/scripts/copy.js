import _     from 'lodash';
import fs    from 'fs-extra';
import path  from 'path';
import async from 'async';

export function copyFolder (folder, output, callback) {
  if (!fs.statSync(folder).isDirectory()) {
    return;
  }

  let files = fs.readdirSync(folder);
  let tasks = _.map(files, function (filename) {
    let file = path.join(folder, filename);

    return function (callback) {
      fs.statSync(file).isDirectory()
      ? copyFolder(file, path.join(output, filename), callback)
      : copy(file, path.join(output, filename), callback);
    };
  });

  tasks = _.filter(tasks);

  async.parallel(tasks, function (error, stats) {
    stats = _.flattenDeep(stats);
    stats = _.filter(stats);

    callback(error, stats);
  });
}

export function copy (file, output, callback) {
  if (!_.isFunction(callback)) {
    throw new Error('callback is not provided');
  }

  fs.stat(file, function (error, stats) {
    if (error) {
      callback(error);
      return;
    }

    fs.copy(file, output, function (error) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, {
        file : output,
        size : stats.size,
      });
    });
  });
}
