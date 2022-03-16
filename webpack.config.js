const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const productionMode = argv.mode === "production";
  const config = require("./config").config(productionMode);
  const outputFilename = "[name].[contenthash]";

  const result = {
    entry: {
      app: [
        "core-js/stable",
        "regenerator-runtime/runtime",
        "whatwg-fetch",
        "./app",
      ],
    },
    output: {
      path: path.resolve(__dirname, "build"),
      filename: `${outputFilename}.js`,
      chunkFilename: `${outputFilename}.js`,
      publicPath: productionMode ? "/build/" : "/",
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      innerGraph: true,
    },
    devServer: {
      port: config.devServerPort,
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules|\.git/,
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
        {
          test: /\.s?css$/,
          use: [
            productionMode ? MiniCssExtractPlugin.loader : "style-loader",
            { loader: "css-loader" },
            { loader: "sass-loader" },
          ],
        },
        {
          test: /\.(jpe?g|png|gif|svg|woff|woff2|ttf|eot)/,
          type: "asset/resource",
        },
      ],
    },
    devtool: productionMode ? "source-map" : "eval-cheap-module-source-map",
    plugins: [
      new webpack.DefinePlugin(config.environmentVars),
      new HtmlWebpackPlugin({
        template: "./public/template.html",
        filename: "index.html",
        favicon: "./public/favicon.ico",
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ],
    resolve: {
      extensions: [".js", ".jsx", ".css", ".scss"],
      modules: [path.resolve("./app"), path.resolve("./node_modules")],
      symlinks: false,
      fallback: {
        path: require.resolve("path-browserify"),
        buffer: require.resolve("buffer"),
        url: require.resolve("url"),
      },
    },
  };

  if (productionMode) {
    result.plugins.push(
      new MiniCssExtractPlugin({
        filename: `${outputFilename}.css`,
        chunkFilename: `${outputFilename}.css`,
      })
    );
  }

  return result;
};
