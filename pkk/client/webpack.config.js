
var webpack = require("webpack");

module.exports = {
    entry: "./main.js",
    output: {
        path: "../static/pkk",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },

    devtool: 'source-map',

    plugins: [
        new webpack.ProvidePlugin({
              Promise: 'imports?this=>global!exports?global.Promise!es6-promise',
              fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch'
         })
    ]
};