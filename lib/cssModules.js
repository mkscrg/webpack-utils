const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');


module.exports = ({ outputFile }) => {
  const plugin = new ExtractTextPlugin(outputFile, { allChunks: true });
  const loader = {
    test: /\.css$/,
    loader: plugin.extract('style', 'css?modules&importLoaders=1!postcss'),
  };
  const postcssConfig = [
    autoprefixer({
      browsers: ['last 2 versions', '> 10%'],
    }),
  ];
  return { plugin, loader, postcssConfig };
};
