const chalk = require('chalk');
const path = require('path');
const textTable = require('text-table');


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

module.exports = () => ({
  preLoader: {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'eslint',
  },
  config: {
    configFile: path.resolve(__dirname, 'eslint-config.json'),
    formatter,
    emitWarning: true,
  },
});
