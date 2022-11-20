const path = require('path');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  devServer: {
    inline: true,
    port: 3000,
    publicPath: '/',
    setup(app) {
      const bodyParser = require('body-parser');

      app.use(bodyParser.json());

      // app.get("/get/some-data", function (req, res) {
      //   console.log(req);
      //   res.send("GET res sent from webpack dev server")
      // })

      // app.post("/post/some-data", bodyParser.json(), function (req, res) {
      //   console.log(req.body);
      //   res.send("POST res sent from webpack dev server")
      // })
    }
  },
  resolve: {
    alias: {
      assets: `${__dirname}/assets/`,
      shaders: `${__dirname}/shaders/`,
      js: `${__dirname}/js/`
    },
    mainFields: ['main']
  },
  entry: {
    code: './client/Main.js',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  module: {
    rules: [{
      test: path.resolve(__dirname, 'assets'),
      exclude: /\.json$/,
      loader: 'file-loader',
      options: { name: '[name]-[hash:8].[ext]', },
    }, {
      test: path.resolve(__dirname, 'shaders'),
      loader: 'file-loader',
      options: { name: '[name]-[hash:8].[ext]', },
    }, {
      test: /\.glsl$/i,
      use: 'raw-loader',
    }, {
      type: 'javascript/auto',
      test: /\.(json)/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'file-loader',
        options: { name: '[name]-[hash:8].[ext]' },
      }],
    }],
  },
  plugins: [
    new HTMLPlugin({
      template: './html/index.html.ejs',
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets/social", to: "" },
      ],
    }),
  ]
};
