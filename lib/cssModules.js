const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = ({ outputFile }) => {
  const plugin = new ExtractTextPlugin(outputFile, { allChunks: true });

  const modulesLoader = {
    test: /\.s?css$/,
    loader: plugin.extract('style-loader', ['css-loader?modules', 'sass-loader']),
  };

  const globalLoader = {
    test: /\.globals?css$/,
    loader: plugin.extract('style-loader', ['css-loader', 'sass-loader']),
  };
  return { plugin, modulesLoader, globalLoader };
};
