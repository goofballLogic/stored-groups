const path = require( "path" );
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
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }

} ];