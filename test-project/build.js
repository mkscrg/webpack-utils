/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved */
const wu = require('webpack-utils');


const moreFlowConfig = {
  ignore: [
    '<PROJECT_ROOT>/node_modules/webpack-utils/test-project/.*',
  ],
};
const moreEslintConfig = {
  rules: {
    'react/jsx-filename-extension': 2,
  },
};

// some utilites return complex objects, e.g. a loader and some config
const {
  plugin: cssPlugin,
  modulesLoader: cssModulesLoader,
  globalLoader: cssGlobalLoader,
} = wu.cssModules({ outputFile: 'wutp.css' });
const { preLoader: eslintPreLoader, config: eslintConfig } = wu.eslint({ moreEslintConfig });

wu.webpackMain(devMode => ({
  entry: './src/main.jsx',
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  output: {
    path: `${__dirname}/dist`,
    filename: 'wutp.js',
  },
  module: {
    preLoaders: [
      eslintPreLoader,
    ],
    loaders: [
      wu.babelJsLoader(),
      cssModulesLoader,
      cssGlobalLoader,
    ],
  },
  plugins: [
    cssPlugin,
    wu.flowPlugin({ moreFlowConfig }),
    wu.indexHtmlPlugin({ title: 'webpack-utils Test Project', rootDivId: 'wutp' }),
    ...(devMode ? [] : [
      wu.minifyPlugin(),
    ]),
  ],
  eslint: eslintConfig,
  devtool: 'sourcemap',
  devServer: {
    port: 8888,
    hostname: 'localhost',
  },
}));
