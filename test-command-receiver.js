const { runTests } = require( "./test-utils.js" );
const { join } = require( "path" );
const assert = require( "assert" );

// file storage
const data = join( __dirname, "data" );
const storage = require( "./storage/file/storage" )( data );
// series
const context = "https://raw.githubusercontent.com/goofballLogic/stored-groups/master/design/things/context.jsonld";
const localContextMap = process.env.USE_LOCAL_CONTEXT && buildLocalContextMap();
const series = require( "./series" )( { storage, context, localContextMap } );
const commandProcessor = require( "./command-processor" )( series );
const { commandTypes, batchKeys } = require( "./command-processor" );

const baseNamespace = "https://app.openteamspace.com";
const simpleTeamsContext = {

    commands: batchKeys.commands,
    series: batchKeys.series,
    props: batchKeys.props,
    keys: batchKeys.keys,
    values: batchKeys.values

};

/*

    The purpose of this command processor is to take batches of commands for a series containing specific mutations and to process them, returning the resulting series


*/

async function createSeries( options, props ) {

    const series = await commandProcessor.process( [ {

        "@context": [ context, simpleTeamsContext ],
        commands: [ {

            "@type": commandTypes.create,
            props,
            options

        } ]

    } ] );
    return {

        series,
        dispose: async () => {

            await commandProcessor.process( [ {

                "@context": [ context, simpleTeamsContext ],
                series: { "@id": series[ "@id" ], base: options.base },
                commands: { "@type": commandTypes.delete }

            } ] )

        }

    }

}

async function withCreatedTeamSeries( name, wrapped ) {

    const { series, dispose } = await createSeries(

        { type: "Team", ns: "teams", base: baseNamespace },
        { name }

    );

    try {

        await wrapped( series );

    } finally {

        await dispose();

    }

}

runTests( "Command receiver tests", {

    async CreateASeriesWithSomeProperties() {

        await withCreatedTeamSeries( "Team Zero", async series => {

            assert.strictEqual( series[ "http://schema.org/name" ], "Team Zero" );

        } );

    },

    async CreateASeriesThenAddUpdateAndRemoveSomeProperties() {

        await withCreatedTeamSeries( "Team One", async series => {

            const { "@id": teamId } = series;
            const updated = await commandProcessor.process( {

                "@context": [ context, simpleTeamsContext ],
                series: {

                    "@id": teamId,
                    [ batchKeys.base ]: baseNamespace

                },
                commands: [ {

                    "@type": commandTypes.setValues,
                    values: {

                        age: 41,
                        sex: "Female",
                        nationality: "DER"

                    }

                }, {

                    "@type": commandTypes.deleteValues,
                    keys: [ "nationality", "age" ]

                }, {

                    "@type": commandTypes.setValues,
                    values: {

                        name: "SJGR"

                    }

                } ]

            } );
            assert.strictEqual( updated[ "http://schema.org/name" ], "SJGR" );
            assert.strictEqual( updated[ "https://vocab.openteamspace.com/sex" ], "Female" );

        } );

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