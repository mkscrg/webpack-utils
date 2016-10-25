const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


module.exports = ({ title, rootDivId, chunks }) => new HtmlWebpackPlugin({
  title,
  chunks,
  rootDivId: rootDivId || 'root',
  template: path.resolve(__dirname, 'index.html.ejs'),
  inject: false,
  minify: {
    html5: true,
    collapseWhitespace: true,
    preserveLineBreaks: true,
  },
});
