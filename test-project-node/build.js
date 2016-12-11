/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved */
const wu = require('webpack-utils');


const moreFlowConfig = {
  ignore: [
    '<PROJECT_ROOT>/node_modules/webpack-utils/test-project-browser/.*',
    '<PROJECT_ROOT>/node_modules/webpack-utils/test-project-node/.*',
  ],
};

const { preLoader: eslintPreLoader, config: eslintConfig } = wu.eslint();

wu.webpackMain(() => ({
  entry: './src/main.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
  },
  target: 'node',
  externals: [wu.nodeExternals()],
  module: {
    preLoaders: [
      eslintPreLoader,
    ],
    loaders: [
      wu.babelJsLoader(),
    ],
  },
  plugins: [
    wu.flowPlugin({ moreFlowConfig }),
  ],
  eslint: eslintConfig,
  devtool: 'sourcemap',
  onWatchSuccess: wu.externalCommand('node', ['dist/index.js']),
}));
