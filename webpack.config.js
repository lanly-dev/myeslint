//@ts-check

'use strict'
const path = require('path')

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: 'none', // make source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode',
    // Don't bundle ESLint and its plugin ecosystem — they contain pre-bundled
    // rolldown/vite artifacts that break webpack's CJS interop at runtime.
    // They are shipped as-is in node_modules instead.
    eslint: 'commonjs eslint',
    'typescript-eslint': 'commonjs typescript-eslint',
    '@typescript-eslint/parser': 'commonjs @typescript-eslint/parser',
    '@typescript-eslint/eslint-plugin': 'commonjs @typescript-eslint/eslint-plugin',
    '@stylistic/eslint-plugin': 'commonjs @stylistic/eslint-plugin'
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log' // enables logging required for problem matchers
  }
}
module.exports = [ extensionConfig ]
