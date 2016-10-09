var webpack = require("webpack");

module.exports = require("./webpack.config.js");
module.exports.devtool = "source-map";
module.exports.plugins = module.exports.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        sourceMap: true
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
    ]
);
