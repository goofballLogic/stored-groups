const { runTestsSequentially } = require( "./test-utils.js" );
const { join } = require( "path" );
// file storage
const data = join( __dirname, "test-data" );
const storage = require( "./storage/file/storage" )( data );
// series
const context = "https://raw.githubusercontent.com/goofballLogic/stored-groups/master/design/things/context.jsonld";
const localContextMap = process.env.USE_LOCAL_CONTEXT && buildLocalContextMap();
const series = require( "./series" )( { storage, context, localContextMap } );

const baseNamespace = "https://app.openteamspace.com";

runTestsSequentially( "Command receiver tests", {

    async test1() {

        console.log( "test 1" );

    },

    async test2() {

        console.log( "test 2" );

    }

} );