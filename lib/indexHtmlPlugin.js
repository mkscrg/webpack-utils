const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


module.exports = ({ title, rootDivId }) => new HtmlWebpackPlugin({
  title,
  rootDivId,
  template: path.resolve(__dirname, 'index.html.ejs'),
  inject: false,
  minify: {
    html5: true,
    collapseWhitespace: true,
    preserveLineBreaks: true,
  },
});
