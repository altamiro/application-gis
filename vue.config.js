const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,

  // Configuração de publicação
  publicPath: "/car-online/",

  // Configuração do servidor de desenvolvimento
  devServer: {
    port: 9292,
    open: false,
    // Configurações atualizadas para webpack 5
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  },

  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        vue$: "vue/dist/vue.esm.js",
        components: path.resolve(__dirname, "src/components"),
        views: path.resolve(__dirname, "src/views"),
        services: path.resolve(__dirname, "src/services"),
        utils: path.resolve(__dirname, "src/utils"),
        store: path.resolve(__dirname, "src/store"),
      },
    },
    performance: {
      hints: false,
    },
    // Otimizações para Node.js v18
    optimization: {
      moduleIds: "deterministic",
      runtimeChunk: "single",
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
    // Add CopyWebpackPlugin to copy ArcGIS assets
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/@arcgis/core/assets",
            to: "assets"
          }
        ]
      })
    ]
  },

  chainWebpack: (config) => {
    // Configuração específica para CSS do ArcGIS
    config.module
      .rule("css")
      .test(/\.css$/)
      .oneOf("normal")
      .use("postcss-loader")
      .tap((options) => {
        options = options || {};
        options.postcssOptions = options.postcssOptions || {};
        options.postcssOptions.plugins = options.postcssOptions.plugins || [];
        return options;
      });

    // Configuração para arquivos Pug
    config.module
      .rule("pug")
      .test(/\.pug$/)
      .use("pug-plain-loader")
      .loader("pug-plain-loader")
      .end();
  },

  productionSourceMap: false,
});