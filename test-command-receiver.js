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

// flush these?

runTestsSequentially( "Command receiver tests", {

    async CreateASeries() {

        return "pending";

    },

    async SetAndGetAValue() {

        return "pending";

    },

    async SetAndResetAndGetAValue() {

        return "pending";

    },

    async SetThenDeleteAndGetAValue() {

        return "pending";

    },

    async ExportSeries() {

        return "pending";

    },

    async CreateCollectionItem() {

        return "pending";

    },

    async CreateThenUpdateACollectionItem() {

        return "pending";

    },

    async CreateButDeleteThenTryToUpdateACollectionItem() {

        return "pending";

    }

} );