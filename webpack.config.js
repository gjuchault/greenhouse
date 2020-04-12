const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssNormalize = require("postcss-normalize");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

function getCssLoader(cssOptions) {
  const loaders = [];

  loaders.push(
    isProd
      ? { loader: MiniCssExtractPlugin.loader }
      : require.resolve("style-loader")
  );

  loaders.push({
    loader: require.resolve("css-loader"),
    options: cssOptions,
  });

  loaders.push({
    loader: require.resolve("postcss-loader"),
    options: {
      ident: "postcss",
      plugins: () => [
        require("postcss-flexbugs-fixes"),
        require("postcss-preset-env")({
          autoprefixer: {
            flexbox: "no-2009",
          },
          stage: 3,
        }),
        postcssNormalize(),
      ],
      sourceMap: isProd,
    },
  });
}

module.exports = {
  mode: isProd ? "production" : "development",
  entry: path.resolve(__dirname, "src/app/index.ts"),
  devtool: isProd ? "source-map" : "cheap-module-source-map",
  output: {
    filename: "static/js/app.[contenthash:8].js",
    path: path.resolve(__dirname, "dist/app"),
    pathinfo: !isProd,
  },
  resolve: {
    extensions: [".js", ".json", ".ts"],
  },
  module: {
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: path.resolve(__dirname, "src/app"),
        loader: require.resolve("babel-loader"),
        options: {
          customize: require.resolve(
            "babel-preset-react-app/webpack-overrides"
          ),
          babelrc: false,
          configFile: false,
          presets: [require.resolve("babel-preset-react-app")],
          cacheDirectory: true,
          compact: isProd,
        },
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        include: path.resolve(__dirname, "src/app"),
        use: getCssLoader({
          importLoaders: 1,
          sourceMap: isProd,
        }),
      },
      {
        test: /\.module\.css$/,
        include: path.resolve(__dirname, "src/app"),
        use: getCssLoader({
          importLoaders: 1,
          sourceMap: isProd,
          modules: true,
        }),
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "./src/app/index.html"),
      minify: isProd,
    }),
    isProd &&
      new MiniCssExtractPlugin({
        filename: "static/css/app.[contenthash:8].css",
      }),
    new ForkTsCheckerWebpackPlugin({
      async: !isProd,
      useTypescriptIncrementalApi: true,
      checkSyntacticErrors: true,
      tsconfig: path.resolve(__dirname, "./tsconfig.app.json"),
      silent: true,
    }),
  ].filter(Boolean),
  devServer: {
    contentBase: "./dist/app",
    stats: "minimal",
  },
};
