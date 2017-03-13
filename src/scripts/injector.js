import _          from 'lodash';
import fs         from 'fs-extra';
import path       from 'path';
import async      from 'async';
import { mkhash } from './utils';

export function injectFolder (folder, output, nodes = {}, callback) {
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
      ? injectFolder(file, path.join(output, filename), nodes, callback)
      : inject(file, path.join(output, filename), nodes, callback);
    };
  });

  tasks = _.filter(tasks);

  async.parallel(tasks, function (error, stats) {
    stats = _.flattenDeep(stats);
    stats = _.filter(stats);

    callback(error, stats);
  });
}

export function inject (file, output, nodes = {}, callback) {
  if (!_.isFunction(callback)) {
    throw new Error('callback is not provided');
  }

  if (!_.isString(output)) {
    callback(new Error('output is not provided'));
    return;
  }

  if (!_.isObject(nodes)) {
    callback(new Error('nodes is not provided'));
    return;
  }

  if (!fs.existsSync(file)) {
    callback(new Error(`'${file}' is not found`));
    return;
  }

  let buffer         = fs.readFileSync(file);
  let content        = buffer.toString();
  let { head, body } = nodes || {};
  let bodyRegExp     = /( *)(%?body)/i;
  let match          = bodyRegExp.exec(content);

  if (match) {
    let hlSpace = match[1].repeat(2);
    if (head) {
      head = head.map(function (asset) {
        return hlSpace + asset;
      });

      content = content.replace(bodyRegExp, head.join('\n') + '\n' + match[0]);
    }

    if (body) {
      body = body.map(function (asset) {
        return hlSpace + asset;
      });

      content += body.join('\n');
    }
  }

  fs.ensureDirSync(path.dirname(output));

  fs.writeFile(output, content, function (error) {
    if (error) {
      callback(error);
      return;
    }

    callback(null, {
      file : output,
      size : content.length,
      hash : mkhash(content),
    });
  });
}
