const path = require( "path" );

const babelLoader = { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" };

module.exports = [ {

    mode: "development",
    entry: "./test/test-idb-data.js",
    output: {
        path: path.resolve( __dirname, "test/dist" ),
        filename: "test-idb-data.js",
        publicPath: "/",
        libraryTarget: "umd"
    },
    module: {
        rules: [ babelLoader ]
    }

}, {

    mode: "development",
    entry: "./test/scratch-pad.js",
    output: {
        path: path.resolve( __dirname, "test/dist" ),
        filename: "scratch-pad.js",
        publicPath: "/",
        libraryTarget: "umd"
    },
    module: {
        rules: [ babelLoader ]
    }

} ];