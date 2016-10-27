const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');


module.exports = ({ outputFile }) => {
  const plugin = new ExtractTextPlugin(outputFile, { allChunks: true });
  const loader = {
    test: /\.s?css$/,
    loader: plugin.extract('style', 'css?modules&importLoaders=2!postcss!sass'),
  };
  const postcssConfig = [
    autoprefixer({
      browsers: ['last 2 versions', '> 10%'],
    }),
  ];
  return { plugin, loader, postcssConfig };
};
