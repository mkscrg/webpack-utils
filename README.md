## webpack-utils

Configuring JS builds is no fun.

For usage see:
- [`test-project-browser/build.js`](test-project-browser/build.js)
- [`test-project-browser/package.json`](test-project-browser/package.json)
- [`test-project-node/build.js`](test-project-node/build.js)
- [`test-project-node/package.json`](test-project-node/package.json)

```javascript
const wu = require('webpack-utils');
```

- [`wu.webpackMain`](lib/webpackMain.js)
- [`wu.indexHtmlPlugin`](lib/indexHtmlPlugin.js)
- [`wu.babelJsLoader`](lib/babelJsLoader.js)
- [`wu.cssModules`](lib/cssModules.js)
- [`wu.eslint`](lib/eslint.js)
- [`wu.flowPlugin`](lib/flowPlugin.js)
- [`wu.minifyPlugin`](lib/minifyPlugin.js)

### Build this project:

Dependencies:

```sh
npm install
```

Linter:

```
npm run lint
```

Test a browser build:

```
# prod mode
npm run test-browser && ( cd test-project-browser/dist/ && python -m SimpleHTTPServer; )
# dev mode
( cd test-project-browser && npm run watch; )
```

Test a node build:

```
# prod mode
npm run test-node
# dev mode
( cd test-project-node && npm run watch; )
