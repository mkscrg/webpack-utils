const _ = require('lodash');
const chalk = require('chalk');
const childProcess = require('child_process');
const flow = require('flow-bin');
const fs = require('fs');


const defaultFlowConfig = {
  ignore: [
    '# fbjs includes a nonstandard Promise definition. See facebook/fbjs#136',
    '.*node_modules/fbjs/lib/Deferred.js.flow$',
  ],
  options: [
    '# fbjs uses some config that we have to redefine. See facebook/flow#1895',
    'suppress_type=$FlowIssue',
    '# Use a stub for CSS modules.',
    "module.name_mapper.extension='css' -> " +
      "'<PROJECT_ROOT>/node_modules/webpack-utils/lib/CssModuleFlowStub.js'",
    'esproposal.class_static_fields=enable',
  ],
};

const flowConfigString = (moreFlowConfig) => {
  const allConfig = _.mergeWith(
    defaultFlowConfig,
    moreFlowConfig,
    (left, right) => (_.isArray(left) ? left.concat(right) : undefined)
  );
  return _.toPairs(allConfig).map(([k, vs]) => `[${k}]\n${vs.join('\n')}`).join('\n');
};

const ensureFlowConfig = (moreFlowConfig) => {
  const configBuffer = Buffer.from(flowConfigString(moreFlowConfig));

  // promisify the 'fs' interface
  const fsp = (f, ...args) => new Promise((resolve, reject) =>
    f(...args, (err, ...res) => (err ? reject(err) : resolve(...res)))
  );
  return fsp(fs.readFile, './.flowconfig')
    .catch((err) => {
      if (err && err.code === 'ENOENT') {
        return null;
      }
      throw err;
    })
    .then((existingConfig) => {
      // back up existing config to './flowconfig.bkp'
      if (existingConfig === null || existingConfig.equals(configBuffer)) {
        return Promise.resolve();
      }
      return fsp(fs.rename, './.flowconfig', './flowconfig.bkp');
    })
    .then(() => fsp(fs.writeFile, './.flowconfig', configBuffer));
};

const startFlowServer = () =>
  new Promise((resolve, reject) => {
    const serverProcess = childProcess.spawn(flow, ['server'], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    const onServerExit = (code) => {
      const err = new Error(`flow server unexpectedly exited: ${code}`);
      reject(err);
      throw err;
    };
    serverProcess.on('close', onServerExit);
    process.on('exit', () => {
      serverProcess.removeListener('close', onServerExit);
      serverProcess.kill();
    });
    serverProcess.stderr.once('data', () => {
      resolve();
    });
  });

const flowStatus = (watchBuild) => {
  const flowArgs = watchBuild
    ? ['status', '--color=always', '--no-auto-start']
    : ['check', '--color=always'];
  const p = new Promise((resolve, reject) =>
    childProcess.execFile(
      flow,
      flowArgs,
      { maxBuffer: 10 * 1024 * 1024 },
      (code, stdout, stderr) => (code ? reject({ code, stdout, stderr }) : resolve())
    ));
  // rejections will be handled asynchronously, so add a null rejection handler to avoid warnings:
  p.then(null, e => Promise.resolve(e));
  return p;
};

const parseFlowErrors = (statusStdout) => {
  /* eslint-disable no-control-regex */
  const blankLineRex = new RegExp('((\u001b\\[0m)*\n){2,}(\u001b\\[0m)*', 'g');
  /* eslint-enable no-control-regex */

  const chunks = statusStdout.replace(blankLineRex, '\u001b[0m\n\n').split('\n\n');
  const errors = chunks
    .map((c) => {
      const firstNewline = c.indexOf('\n');
      const file = chalk.stripColor(c.substring(0, firstNewline)).replace(/:\d+$/, '');
      const message = c.substring(firstNewline + 1);
      return file && message ? { file: `./${file}`, message } : null;
    })
    .filter(e => !!e);

  return errors;
};

module.exports = ({ moreFlowConfig } = {}) => ({
  apply: (compiler) => {
    let watchBuild = false;
    compiler.plugin('run', (_compiler, callback) =>
      ensureFlowConfig(moreFlowConfig)
        .then(callback, err => callback(err))
    );
    compiler.plugin('watch-run', (_watching, callback) => {
      if (!watchBuild) { // this callback fires on every compilation. only do setup the first time
        watchBuild = true;
        ensureFlowConfig(moreFlowConfig)
          .then(startFlowServer)
          .then(callback, err => callback(err));
      } else {
        callback();
      }
    });

    let statusPromise;
    compiler.plugin('compile', () => {
      statusPromise = flowStatus(watchBuild);
    });

    compiler.plugin('after-emit', (compilation, callback) =>
      statusPromise.then(callback, ({ stdout, stderr }) => {
        if (stderr && !stdout) {
          callback(`Fatal error running \`flow check\`:\n${stderr}`);
        } else {
          // treat all flow issues as warnings, to avoid blocking bundling
          compilation.warnings.push(...parseFlowErrors(stdout));
          callback();
        }
      })
    );
  },
});
