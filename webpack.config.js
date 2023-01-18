const webpack = require("webpack");

module.exports = {
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"],
        fallback: {
            buffer: require.resolve('buffer/'),
            stream: require.resolve('stream-browserify')
        },      
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