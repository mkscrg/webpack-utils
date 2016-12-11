const copyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const babelJsLoader = require('./babelJsLoader');
const cssModules = require('./cssModules');
const eslint = require('./eslint');
const externalCommand = require('./externalCommand');
const flowPlugin = require('./flowPlugin');
const indexHtmlPlugin = require('./indexHtmlPlugin');
const minifyPlugin = require('./minifyPlugin');
const webpackMain = require('./webpackMain');


module.exports = {
  babelJsLoader,
  copyPlugin,
  cssModules,
  eslint,
  externalCommand,
  flowPlugin,
  indexHtmlPlugin,
  minifyPlugin,
  nodeExternals,
  webpackMain,
};
