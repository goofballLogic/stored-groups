const { runTests } = require( "./test-utils.js" );
const { join } = require( "path" );
const { strictEqual } = require( "assert" );

// file storage
const data = join( __dirname, "data" );
const storage = require( "./storage/file/storage" )( data );
// series
const context = "https://raw.githubusercontent.com/goofballLogic/stored-groups/master/design/things/context.jsonld";
const localContextMap = process.env.USE_LOCAL_CONTEXT && buildLocalContextMap();
const series = require( "./series" )( { storage, context, localContextMap } );
const commandProcessor = require( "./command-processor" )( series );
const { commandTypes } = require( "./command-processor" );

const baseNamespace = "https://app.openteamspace.com";

// flush these?

/*

    The purpose of this command processor is to take batches of commands for a series containing specific mutations and to process them, returning the resulting series


*/

async function createSeries( options, props ) {

    const series = await commandProcessor.process( [ {

        "@context": context,
        "@type": commandTypes.create,
        props,
        options

    } ] );
    return {

        series,
        dispose: async () => {

            await commandProcessor.process( [ {

                "@context": context,
                "@type": commandTypes.delete,
                "series": { "@id": series[ "@id" ], base: options.base }

            } ] )

        }

    }

}

runTests( "Command receiver tests", {

    async CreateASeriesWithSomeProperties() {

        const { series, dispose } = await createSeries(

            { type: "Team", ns: "teams", base: baseNamespace },
            { name: "Team Zero" }

        );

        try {

            const expected = "Team Zero";
            const actual = series[ "http://schema.org/name" ];
            strictEqual( actual, expected );

        } finally {

            await dispose();

        }

    },

    async CreateASeriesThenAddUpdateAndRemoveSomeProperties() {

        return "pending";

    },

    async CreateASeriesWithSomeItems() {

        return "pending";

    },

    async CreateASeriesWithSomeItemsThenAddUpdateAndRemoveThen() {

        return "pending";

    },

    async CreateASeriesThenCreateANestedSeriesWithSomePropertiesAndSomeItemsThenAddUpdateAndRemoveSomePropertiesAndAddUpdateAndRemoveSomeItems() {

        return "pending"

    }

} );