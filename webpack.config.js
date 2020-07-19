const path = require('path')
const { config: dotenv } = require('dotenv')
const { EnvironmentPlugin } = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssNormalize = require('postcss-normalize')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

function getEnvironmentVariables() {
  dotenv({ path: path.resolve(__dirname, './.env.local') })
  dotenv({ path: path.resolve(__dirname, './.env') })

  const resultEnvKeys = Object.keys(process.env).filter((key) =>
    key.startsWith('APP_')
  )

  return resultEnvKeys
}

function getCssLoader(cssOptions) {
  const loaders = []

  loaders.push(
    isProd
      ? { loader: MiniCssExtractPlugin.loader }
      : require.resolve('style-loader')
  )

  loaders.push({
    loader: require.resolve('css-loader'),
    options: cssOptions,
  })

  loaders.push({
    loader: require.resolve('postcss-loader'),
    options: {
      ident: 'postcss',
      plugins: () => [
        require('postcss-flexbugs-fixes'),
        require('postcss-preset-env')({
          autoprefixer: {
            flexbox: 'no-2009',
          },
          stage: 3,
        }),
        require('postcss-color-mod-function'),
        postcssNormalize(),
      ],
      sourceMap: isProd,
    },
  })

  return loaders
}

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: path.resolve(__dirname, 'src/app/index.tsx'),
  devtool: isProd ? 'source-map' : 'cheap-module-source-map',
  output: {
    filename: 'static/js/app.[hash:8].js',
    path: path.resolve(__dirname, 'dist/app'),
    pathinfo: !isProd,
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  module: {
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /\.tsx?$/,
        include: path.resolve(__dirname, 'src/app'),
        loader: require.resolve('ts-loader'),
        options: {
          transpileOnly: true,
          compilerOptions: {
            jsx: 'react',
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        include: path.resolve(__dirname, 'src/app'),
        use: getCssLoader({
          importLoaders: 1,
          sourceMap: isProd,
        }),
      },
      {
        test: /\.module\.css$/,
        include: path.resolve(__dirname, 'src/app'),
        use: getCssLoader({
          importLoaders: 1,
          sourceMap: isProd,
          modules: true,
        }),
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, './src/app/index.html'),
      minify: isProd,
    }),
    isProd &&
      new MiniCssExtractPlugin({
        filename: 'static/css/app.[hash:8].css',
      }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, './src/app/tsconfig.json'),
      },
      async: !isProd,
      logger: { infrastructure: 'silent', issues: 'silent' },
    }),
    new EnvironmentPlugin(getEnvironmentVariables()),
  ].filter(Boolean),
  devServer: {
    hot: true,
    historyApiFallback: true,
    // contentBase: './dist/app',
    stats: 'minimal',
  },
}
