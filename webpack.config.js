const webpack = require("webpack");

module.exports = {
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"],
        fallback: {
            buffer: require.resolve('buffer/'),
            stream: require.resolve('stream-browserify')
        },      
    },
    module: {
        rules: [
          {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
          },
          {
            test: /\.svg$/,
            use: ['@svgr/webpack', 'url-loader'],
          },
          {
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: [
                  "@babel/preset-env",
                  "@babel/preset-react",
                  "@babel/preset-typescript",
                ],
              },
            }
          }
        ],
      },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser",
          }),
          new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
          })
    ]
  };