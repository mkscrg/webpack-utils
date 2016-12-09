module.exports = ({ envConfig } = {}) => ({
  test: /\.jsx?$/,
  exclude: /node_modules/,
  loader: 'babel',
  query: {
    presets: [
      ['env', ...(envConfig || [])],
      'react',
      'stage-2',
    ],
  },
});
