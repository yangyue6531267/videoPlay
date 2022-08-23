const path = require("path");
var webpack = require("webpack");
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { CCP_URL, FILE_URL, CVMCURL } = require(`../config/${process.env.NODE_ENV}.js`);
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


module.exports = {
  mode: "production",
  devtool: "inline-source-map",

  entry: {
    CloudPlayback: "./src/ts/index.ts",
  },
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: "[name].min.js",
    library: "[name]",
    libraryTarget: "umd",
    libraryExport: "default",
    umdNamedDefine: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    preferRelative: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      CLOUDWEBCAST_VERSION: `"${require("../package.json").version}"`,
      CLOUDWEBCAST_URL: CCP_URL,
      CLOUDWEBCAST_CVMCURL: CVMCURL,
      CLOUDWEBCAST_FILE_URL: FILE_URL
    }),
    // new CompressionPlugin(
    //   { 
    //     filename: '[name].min.js.gz',
    //     algorithm: 'gzip',//算法
    //     test: new RegExp(
    //       '\\.(js|css)$'    //压缩 js 与 css
    //     ),
    //     threshold: 10240,//只处理比这个值大的资源。按字节计算
    //     minRatio: 0.8//只有压缩率比这个值小的资源才会被处理
    //   }
    // ),
    new BundleAnalyzerPlugin()
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
            options: {
              plugins: [autoprefixer, cssnano],
            },
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
};
