const fs   = require('fs');
const path = require('path');

let filename = '/bloke.theme.config.js';
let es5 = path.join(__dirname, './dist', filename);
let es6 = path.join(__dirname, './src', filename);

if (fs.existsSync(es5)) {
  module.exports = require(es5).default;
}
else {
  require('babel-register');
  require('babel-preset-es2015');
  require('babel-preset-stage-0');

  module.exports = require(es6).default;
}
