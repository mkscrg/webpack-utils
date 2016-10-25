## webpack-utils

Configuring JS builds is no fun.

See [`test-project/build.js`](test-project/build.js) and
[`test-project/package.json`](test-project/package.json) for usage.

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

Build this project:

```sh
npm install
# run eslint
npm run lint
# run a test build in prod mode
npm run test && ( cd test-project/dist/ && python -m SimpleHTTPServer; )
open localhost:8000
# run a test build in dev mode
( cd test-project && npm run watch; )
open localhost:8888
```
