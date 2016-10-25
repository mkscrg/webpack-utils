const webpack = require('webpack');


module.exports = () => {
  const plugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    // UglifyJsPlugin also minifies CSS. odd!
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      comments: false,
    }),
  ];

  return {
    apply: (compiler) => {
      plugins.forEach(p => p.apply(compiler));
    },
  };
};
