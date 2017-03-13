import _         from 'lodash';
import path      from 'path';
import crypto    from 'crypto';
import colors    from 'colors';
import columnify from 'columnify';

export function mkhash (content) {
  let shasum = crypto.createHash('sha1');
  shasum.update(content + '');
  return shasum.digest('hex');
}

export function signhash (file, hash) {
  let folder   = path.dirname(file);
  let filename = path.basename(file);
  let extname  = path.extname(file);

  return path.join(folder, filename.replace(extname, '') + '.' + hash + extname);
}

/**
 * Print results
 * @param  {Array}  stats   result set
 * @param  {Object} options columnify setting
 * @return {Boolean}
 */
export function printStats (stats, options) {
  /* istanbul ignore if */
  if (_.isEmpty(stats)) {
    return false;
  }

  options = _.defaultsDeep(options, {
    truncate: true,
    headingTransform (heading) {
      return (heading.charAt(0).toUpperCase() + heading.slice(1)).white.bold;
    },
    config: {
      assets: {
        align    : 'right',
        dataTransform (file) {
          return colors.green(file).bold;
        },
      },
      size: {
        align: 'right',
        dataTransform (size) {
          return formatBytes(size);
        },
      },
    },
  });

  /* eslint no-console:off */
  trace(columnify(stats, options) + '\n');
  return true;
}

/**
 * print stats
 */
export function trace () {
  /* eslint no-console:off */
  !process.env.SILENT && console.log.apply(console, arguments);
}

/**
 * format size by unit
 * @param  {Number} bytes    size
 * @param  {Number} decimals
 * @return {String}
 */
export function formatBytes (bytes, decimals) {
  bytes = bytes * 1;

  if (0 === bytes || !bytes) {
    return '0 Bytes';
  }

  let k     = 1024;
  let dm    = decimals + 1 || 3;
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i     = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
