const copyPlugin = require('copy-webpack-plugin');

const babelJsLoader = require('./babelJsLoader');
const cssModules = require('./cssModules');
const eslint = require('./eslint');
const flowPlugin = require('./flowPlugin');
const indexHtmlPlugin = require('./indexHtmlPlugin');
const minifyPlugin = require('./minifyPlugin');
const webpackMain = require('./webpackMain');


module.exports = {
  babelJsLoader,
  copyPlugin,
  cssModules,
  eslint,
  flowPlugin,
  indexHtmlPlugin,
  minifyPlugin,
  webpackMain,
};
