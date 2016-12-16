/* @flow */
const express = require('express');


const app = express();

app.get('/', (_req, res: express$Response) => {
  res.status(200).send('Hello, world!');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);  // eslint-disable-line no-console
  console.log('Press Ctrl+C to quit.');  // eslint-disable-line no-console
});
