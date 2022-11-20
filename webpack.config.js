const path = require('path');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const os = require('os');

const DEV_SERVER_PORT = 3000;

module.exports = {
  devServer: {
    inline: true,
    port: DEV_SERVER_PORT,
    publicPath: '/',
    host: '0.0.0.0',
    disableHostCheck: true,
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
    new class LogServerLinksPlugin {
      apply(compiler) {
        const ip = os.networkInterfaces().Ethernet[1].address;

        compiler.hooks.done.tap("LogServerLinksPlugin", () => {
          setTimeout(() => {
            console.log(`\n`);
            console.log('\x1b[94m%s\x1b[0m', `Localhost: http://localhost:${DEV_SERVER_PORT}/`);
            console.log('\x1b[94m%s\x1b[0m', `Network: http://${ip}:${DEV_SERVER_PORT}/`);
            console.log(`\n`);
          }, 300);
        });
      }
    }
  ]
};