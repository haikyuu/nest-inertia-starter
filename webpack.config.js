const { NODE_ENV } = process.env;
const isProd = NODE_ENV === 'production';
const isDev = !isProd;
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');
const SpawnServerPlugin = require('spawn-server-webpack-plugin');

const MarkoPlugin = require('@marko/webpack/plugin').default;

const mode = isDev ? 'development' : 'production';
const markoPlugin = new MarkoPlugin();
// const spawnedServer =
//   isDev &&
//   new SpawnServerPlugin({
//     args: [
//       '--enable-source-maps',
//       // Allow debugging spawned server with the INSPECT_SERVER=1 env var.
//     ].concat(process.env.INSPECT_SERVER ? '--inspect-brk' : []),
//   });
const filenameTemplate = `${isProd ? '[id]' : `[name].modern`}.[contenthash:8]`;
const babelConfig = {
  caller: {
    target: 'web',
    compiler: 'modern',
  },
};
const publicPath = 'static/'; // the path served by express static
module.exports = [
  {
    entry: ['./src/main.ts'],
    watch: true,
    target: 'node',
    externals: [
      nodeExternals({
        allowlist: [/\.(?!(?:js|json)$)[^.]+$/],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.marko$/,
          loader: '@marko/webpack/loader',
          options: {
            target: 'server',
            // babelConfig: { caller: { target: 'node', compiler: 'async-node' } },
          },
        },
        {
          test: /.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    mode,
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.marko'],
    },
    plugins: [
      // new webpack.HotModuleReplacementPlugin(),
      new StartServerPlugin({ name: 'server.js' }),
      // isDev && spawnedServer,
      markoPlugin.server,
    ],
    output: {
      libraryTarget: 'commonjs2',
      path: path.join(__dirname, 'dist'),
      filename: 'server.js',
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      publicPath,
    },
  },
  {
    mode,
    bail: true,
    resolve: {
      extensions: ['.js', '.json', '.marko'],
    },
    module: {
      rules: [
        {
          test: /\.marko$/,
          loader: '@marko/webpack/loader',
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            cacheDirectory: true,
            ...babelConfig,
          },
        },
        // If using `style` blocks with Marko you must use an appropriate loader
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [markoPlugin.browser],
    output: {
      filename: `${filenameTemplate}.js`,
      path: path.join(__dirname, 'dist/client'),
      publicPath,
    },
  },
];
