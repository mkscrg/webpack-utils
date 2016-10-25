const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const textTable = require('text-table');
const tmp = require('tmp');

const eslintBaseConfig = require('./eslint-config.json');


const formatter = (results) => {
  // invariant: results is a single-element array
  // https://github.com/MoOx/eslint-loader/blob/1.3.0/index.js#L26
  if (!(results && results.length === 1)) {
    throw new Error('Invariant violation: eslint-loader produced unexpected results');
  }
  const messages = results[0].messages;

  // table formatting very similar to default 'stylish' formatter
  const stylishOutput = textTable(
    messages.map((msg) => {
      let type;
      if (msg.fatal || msg.severity === 2) {
        type = chalk.red('error');
      } else {
        type = chalk.yellow('warning');
      }

      return [
        '',
        msg.line || 0,
        msg.column || 0,
        type,
        msg.message.replace(/\.$/, ''),
        chalk.dim(msg.ruleId || ''),
      ];
    }),
    {
      align: ['', 'r', 'l'],
      stringLength: str => chalk.stripColor(str).length,
    })
    .split('\n').map(el => el.replace(/(\d+)\s+(\d+)/, (_m, p1, p2) => chalk.dim(`${p1}:${p2}`)))
    .join('\n');

  // webpack is not careful with its color output, so prepend a reset sequence
  return `\u001b[0m${stylishOutput}`;
};

module.exports = ({ moreEslintConfig } = {}) => {
  const eslintConfig = _.mergeWith(
    eslintBaseConfig,
    moreEslintConfig,
    (left, right) => (_.isArray(left) ? left.concat(right) : undefined)
  );

  const { name: configFile, fd: configFileFd } = tmp.fileSync();
  fs.writeSync(configFileFd, JSON.stringify(eslintConfig));

  return {
    config: {
      configFile,
      formatter,
      emitWarning: true,
    },
    preLoader: {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint',
    },
  };
};
