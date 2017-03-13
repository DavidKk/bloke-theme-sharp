import _                             from 'lodash';
import fs                            from 'fs-extra';
import path                          from 'path';
import colors                        from 'colors';
import chokidar                      from 'chokidar';
import promisify                     from 'es6-promisify';
import * as VARS                     from './variables';
import { compileFolder }             from './style';
import {
  transformFolder,
  transform,
}                                    from './babel';
import { copyFolder as _copyFolder } from './copy';
import {
  trace,
  printStats,
}                                    from './utils';

let log                  = trace.bind(null, `[${colors.blue('BK')}] `);
let compileStyleFolder   = promisify(compileFolder);
let transformBabelFolder = promisify(transformFolder);
let transformBabel       = promisify(transform);
let copyFolder           = promisify(_copyFolder);

export function compile (options) {
  options = _.defaultsDeep(options, {
    watch    : false,
    src      : VARS.RESOURCE_PATH,
    dist     : VARS.DISTRICT_PATH,
    style    : './styles',
    script   : './scripts',
    template : './templates',
  });

  function _compile (done) {
    let startTime = Date.now();

    fs.removeSync(options.dist);

    let plugins = [
      require.resolve('babel-plugin-transform-es2015-modules-amd'),
    ];

    Promise.all([
      compileStyleFolder(absolutePath(options.style, options.src), absolutePath(options.style, options.dist)),
      transformBabelFolder(absolutePath(options.script, options.src), absolutePath(options.script, options.dist), { plugins }),
      copyFolder(absolutePath(options.template, options.src), absolutePath(options.template, options.dist)),
      transformBabel(path.join(options.src, './bloke.theme.config.js'), path.join(options.dist, './bloke.theme.config.js')),
    ])
    .then(function (chunk) {
      chunk = _.flattenDeep(chunk);
      chunk = _.filter(chunk);

      let stats = _.map(chunk, function ({ file, size }) {
        return {
          assets : file.replace(VARS.DISTRICT_PATH, ''),
          size   : size,
        };
      });

      trace('Compiler: Bloke Theme Sharp');
      trace(`Time: ${colors.bold(colors.white(Date.now() - startTime))}ms\n`);

      printStats(stats);

      _.isFunction(done) && done();
    });
  }

  _compile(function () {
    if (true === options.watch) {
      let watcher = chokidar.watch(options.src, {
        persistent       : true,
        ignoreInitial    : true,
        awaitWriteFinish : {
          stabilityThreshold : 1000,
          pollInterval       : 100
        },
      });

      watcher.on('all', function (type, file) {
        log(`${colors.green(file.replace(options.src, ''))} has been ${type}.\n`);
        _compile();
      });

      process.on('exit', watcher.close.bind(watcher));
      process.on('SIGINT', function () {
        watcher.close();
        process.exit();
      });
    }
  });
}

function absolutePath (route = '', cwd = '') {
  return path.isAbsolute(route) ? route : path.resolve(cwd, route);
}

// start();

// function start () {
//   Promise.all([
//     style(path.join(VARS.RESOURCE_PATH, './styles'), path.join(VARS.DISTRICT_PATH, './assets/styles')),
//     babel(path.join(VARS.RESOURCE_PATH, './scripts'), path.join(VARS.RESOURCE_PATH, './assets/scripts')),
//   ])
//   .then(function ([styleChunk, babelChunk]) {
//     let chunk = styleChunk.concat(babelChunk);
//     chunk     = _.flattenDeep(chunk);
//     chunk     = _.filter(chunk);
//     chunk     = _.map(chunk, expand);

//     let group      = _.groupBy(chunk, 'type');
//     let styleNodes = _.map(group.css, function ({ assets }) {
//       return `link(rel="stylesheet", href="${ assets }")`;
//     });

//     let scriptNodes = _.map(group.js, function ({ assets }) {
//       return `script(src="${ assets }")`;
//     });

//     Promise.all([
//       template(path.join(VARS.RESOURCE_PATH, './templates'), path.join(VARS.DISTRICT_PATH, './templates'), {
//         head : styleNodes,
//         body : scriptNodes,
//       }),
//       copy(path.join(VARS.RESOURCE_PATH, './templates/partials/'), path.join(VARS.DISTRICT_PATH, './templates/partials/')),
//     ])
//     .then(function ([tplChunk]) {
//       fs.copy(
//       path.join(VARS.RESOURCE_PATH, './templates/partials/'),
//       path.join(VARS.DISTRICT_PATH, './templates/partials/'),
//       function (error) {
//         if (error) {
//           log(error);
//           return;
//         }

//         tplChunk = _.map(tplChunk, expand);
//         chunk    = chunk.concat(tplChunk);

//         let stats = _.map(chunk, function ({ assets, size }) {
//           return { assets, size };
//         });

//         printStats(stats);
//       });
//     });
//   });

//   function expand ({ file, hash, size }) {
//     let assets  = file.replace(VARS.DISTRICT_PATH, '');
//     let extname = path.extname(assets);

//     return { assets, file, hash, size, type: extname.substr(1) };
//   }
// }
