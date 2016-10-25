const chalk = require('chalk');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const MemoryFS = require('memory-fs');
const mime = require('mime');
const path = require('path');
const url = require('url');


// similar to github.com/webpack/webpack-dev-middleware, but doesn't call .watch()
const webpackMiddleware = (compiler) => {
  const parseFilename = (urlStr) => {
    const pathname = url.parse(urlStr).pathname;
    const publicPath = compiler.options.output.publicPath || '/';
    if (pathname.indexOf(publicPath) !== 0) return null;
    return path.join(compiler.outputPath, pathname.substring(publicPath.length));
  };

  const state = { bundleReady: false, doneCallbacks: [] };
  compiler.plugin('invalid', () => { state.bundleReady = false; });
  compiler.plugin('watch-run', (_watching, callback) => {
    state.bundleReady = false;
    callback();
  });
  compiler.plugin('done', () => {
    state.bundleReady = true;
    process.nextTick(() => {
      if (!state.bundleReady) return;
      const cbs = state.doneCallbacks;
      state.doneCallbacks = [];
      cbs.forEach(cb => cb());
    });
  });

  const memfs = new MemoryFS();
  compiler.outputFileSystem = memfs;  // eslint-disable-line no-param-reassign

  return (req, res, next) => {
    const respond = () => {
      // memory-fs throws on missing parent paths. annoying!
      let filename;
      try {
        filename = parseFilename(req.url);
        if (filename === null) throw new Error('next');

        let stat = memfs.statSync(filename);
        if (stat.isDirectory()) {
          filename = path.join(filename, 'index.html');
          stat = memfs.statSync(filename);
        }
        if (!stat.isFile()) throw new Error('next');
      } catch (_) {
        next();
        return;
      }

      const content = memfs.readFileSync(filename);
      res.setHeader('Content-Type', mime.lookup(filename));
      res.setHeader('Content-Length', content.length);
      if (res.send) res.send(content);
      else res.end(content);
    };
    if (state.bundleReady) {
      respond();
    } else {
      state.doneCallbacks.push(respond);
    }
  };
};

const notFoundMiddleware = (_req, res) => res.status(404).send('Not found');

const defaultOptions = {
  port: 8000,
  hostname: 'localhost',
  https: null,
  middleware: [],
};

module.exports = (compiler, handleResults, passedOptions) => {
  const options = Object.assign({}, defaultOptions, passedOptions);

  const app = express();
  app.use(webpackMiddleware(compiler));
  options.middleware.forEach(mw => app.use(mw));
  app.use(notFoundMiddleware);

  let server;
  if (options.https) {
    const key = fs.readFileSync(options.https.keyPath);
    const cert = fs.readFileSync(options.https.certPath);
    server = https.createServer({ key, cert }, app);
  } else {
    server = http.createServer(app);
  }
  server.listen(options.port, options.hostname);

  const addr = `http${options.https ? 's' : ''}://${options.hostname}:${options.port}`;
  console.log(chalk.magenta(`Serving dev build: ${addr}\n`)); // eslint-disable-line no-console

  compiler.watch({}, handleResults);
};
