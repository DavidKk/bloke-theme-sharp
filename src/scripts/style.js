import _     from 'lodash';
import fs    from 'fs-extra';
import path  from 'path';
import sass  from 'node-sass';
import async from 'async';

export function compileFolder (folder, output, callback) {
  if (!fs.statSync(folder).isDirectory()) {
    return;
  }

  let files = fs.readdirSync(folder);
  let tasks = _.map(files, function (filename) {
    let file = path.join(folder, filename);

    if ('_' === filename.substr(0, 1)) {
      return;
    }

    return function (callback) {
      fs.statSync(file).isDirectory()
      ? compileFolder(file, path.join(output, filename), callback)
      : compile(file, path.join(output, filename), callback);
    };
  });

  tasks = _.filter(tasks);

  async.parallel(tasks, function (error, stats) {
    stats = _.flattenDeep(stats);
    stats = _.filter(stats);

    callback(error, stats);
  });
}

export function compile (file, output, callback) {
  sass.render({
    file         : file,
    includePaths : [
      path.join(__dirname, '../../node_modules'),
    ],
  },
  function (error, result) {
    if (error) {
      callback(error);
      return;
    }

    let content  = result.css.toString();
    let filename = path.basename(output);

    output = output.replace(path.extname(filename), '.css');

    fs.ensureDirSync(path.dirname(output));

    fs.writeFile(output, content, function (error) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, {
        file : output,
        size : content.length,
      });
    });
  });
}
