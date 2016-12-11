const chalk = require('chalk');
const childProcess = require('child_process');


module.exports = (command, args = []) => {
  /* eslint-disable no-console */
  let child = null;

  const onEarlyExit = (code) => {
    child = null;
    console.log(chalk.yellow(`External command exited with status ${code}.`));
  };

  return () => {
    const stopPromise = new Promise((resolve) => {
      if (child !== null) {
        child.removeListener('exit', onEarlyExit);
        child.on('exit', () => resolve());
        child.kill();
      } else {
        resolve();
      }
    });

    stopPromise.then(() => {
      console.log(chalk.yellow(`Running external command: ${command} ${args.join(' ')}`));
      child = childProcess.spawn(command, args, { stdio: ['ignore', 'inherit', 'inherit'] });
      child.on('exit', onEarlyExit);
    });
  };
  /* eslint-enable no-console */
};
