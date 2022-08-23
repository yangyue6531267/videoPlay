const path = require("path");
var webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const { CCP_URL, FILE_URL, CVMCURL } = require(`../config/${process.env.NODE_ENV}.js`);



module.exports = {
  mode: "production",
  devtool: "inline-source-map",
  // 取消调试
  // target: "web",
  entry: {
    CloudPlayback: "./src/ts/index.ts",
  },
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd",
    libraryExport: "default",
    umdNamedDefine: true,
    publicPath: "/",
  },
  performance: {
    maxEntrypointSize: 40000000,
    maxAssetSize: 40000000,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    preferRelative: true,
  },
  externals: [
    {
      // "handlebars/runtime": {
      //   root: "Handlebars",
      //   amd: "handlebars.runtime",
      //   commonjs2: "handlebars/runtime",
      //   commonjs: "handlebars/runtime",
      // },
      // handlebars: {
      //   root: "Handlebars",
      //   amd: "Handlebars",
      //   commonjs: "handlebars",
      //   commonjs2: "handlebars",
      // },
      // "art-template/runtime": {
      //   root: "art-template",
      //   amd: "art-template.runtime",
      //   commonjs2: "art-template/lib/runtime",
      //   commonjs: "art-template/libruntime",
      // },
      // "art-template": {
      //   root: "art-template",
      //   amd: "art-template",
      //   commonjs: "art-template",
      //   commonjs2: "art-template",
      // },
    },
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        loader: "url-loader",
        options: {
          limit: 40000,
        },
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
          },
          "sass-loader",
        ],
      },
      {
        test: /\.art$/,
        loader: "art-template-loader",
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
      { test: /\.handlebars$/, loader: "handlebars-loader" },
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  infrastructureLogging: {
    // Only warnings and errors
    // level: 'none' disable logging
    // Please read https://webpack.js.org/configuration/other-options/#infrastructurelogginglevel
    level: "warn",
  },
  // stats: "errors-warnings",
  watchOptions: {
    ignored: /node_modules/,
  },

  plugins: [
    new webpack.DefinePlugin({
      CLOUDWEBCAST_VERSION: `"${require("../package.json").version}"`,
      CLOUDWEBCAST_URL: CCP_URL,
      CLOUDWEBCAST_CVMCURL: CVMCURL,
      CLOUDWEBCAST_FILE_URL: FILE_URL
    }),
  ],
  devServer: {
    hot: true,
    host: "192.168.0.148",
    liveReload: true,
    static: [
      path.resolve(__dirname, "..", "demo"),
      {
        directory: path.resolve(__dirname, "..", "demo"),
        staticOptions: {},
        // Don't be confused with `dev.publicPath`, it is `publicPath` for static directory
        // Can be:
        // publicPath: ['/static-public-path-one/', '/static-public-path-two/'],
        publicPath: "/demo/",
        // Can be:
        // serveIndex: {} (options for the `serveIndex` option you can find https://github.com/expressjs/serve-index)
        serveIndex: true,
        // Can be:
        // watch: {} (options for the `watch` option you can find https://github.com/paulmillr/chokidar)
        watch: true,
      },
    ],
    // static: path.join(__dirname, "..", "demo"),
    compress: true,
    port: 9000,
    // quiet: false,
    // stats: 'errors-warnings',
    open: true,
    // hot: false,
    // hotOnly: true,
    // index: "index.html",
    // public: "/",
    // serveIndex: true,
    // historyApiFallback: {
    //   disableDotRule: false,
    // },
  },
};
