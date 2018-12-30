const { resolve } = require( "path" );

module.exports = {

    entry: resolve( __dirname, "./domain" ),
    output: {
        filename: "main.js",
        libraryTarget: "umd"
    },
    optimization: {
        minimize: false
    }
}