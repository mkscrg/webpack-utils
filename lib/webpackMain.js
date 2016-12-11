const chalk = require('chalk');
const pluralize = require('pluralize');
const webpack = require('webpack');
const yargs = require('yargs');

const devServer = require('./devServer');


const parseDevModeArg = () =>
  yargs
    .boolean('dev')
    .check((argv) => {
      if (!argv.dev && process.env.NODE_ENV !== 'production') {
        throw new Error('set NODE_ENV=production for non-dev builds');
      }
      return true;
    })
    .argv.dev;

const buildingPlugin = {
  apply: (compiler) => {
    const sayBuilding = (_ctx, callback) => {
      console.log(chalk.magenta('\nBuilding...'));  // eslint-disable-line no-console
      callback();
    };
    compiler.plugin('run', sayBuilding);
    compiler.plugin('watch-run', sayBuilding);
  },
};

const nodeEnvPlugin = new webpack.DefinePlugin({
  'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
});

const handleResults = (exitOnError, onWatchSuccess) => (err, stats) => {
  /* eslint-disable no-console */

  // fatal error
  if (err) {
    console.log([
      chalk.red('Fatal build error:'),
      err ? err.stack : err,
    ].join('\n'));
    process.exit(1);
    return;
  }

  // success
  if (!stats.hasErrors() && !stats.hasWarnings()) {
    console.log(chalk.green('Build success.'));
    if (onWatchSuccess) {
      onWatchSuccess();
    }
    return;
  }

  // normal errors
  const { errors, warnings } = stats.toJson();
  errors.forEach((error) => {
    const firstNewline = error.indexOf('\n');
    console.log([
      chalk.red(`ERROR in ${error.substring(0, firstNewline)}`),
      error.substring(firstNewline + 1),
    ].join('\n'));
  });
  warnings.forEach((warning) => {
    const firstNewline = warning.indexOf('\n');
    console.log([
      chalk.yellow(`WARNING in ${warning.substring(0, firstNewline)}`),
      warning.substring(firstNewline + 1),
    ].join('\n'));
  });
  console.log(chalk.red([
    'Build failure: ',
    pluralize('error', errors.length, true),
    ', ',
    pluralize('warning', warnings.length, true),
    '\n',
  ].join('')));
  if (exitOnError) process.exit(1);
  /* eslint-enable no-console */
};

module.exports = (configFn) => {
  const devMode = parseDevModeArg();
  const config = configFn(devMode);

  const compiler = webpack(config);
  buildingPlugin.apply(compiler);
  nodeEnvPlugin.apply(compiler);

  if (devMode) {
    const devServerOptions = config.devServer;
    if (devServerOptions) {
      devServer(compiler, handleResults(false), devServerOptions);
    } else {
      compiler.watch({}, handleResults(false, config.onWatchSuccess));
    }
  } else {
    compiler.run(handleResults(true));
  }
};
