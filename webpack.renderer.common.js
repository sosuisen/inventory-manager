const path = require('path');

module.exports = {
  entry: './src/renderer.ts',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'renderer.js',
  },
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js', // for node_modules
    ],
    modules: ['node_modules'],
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};
