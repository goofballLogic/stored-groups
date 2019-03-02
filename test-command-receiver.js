const { runTests } = require( "./test-utils.js" );
const { join } = require( "path" );
const assert = require( "assert" );
const { buildLocalContextMap, context } = require( "./test-utils" );

// file storage
const data = join( __dirname, "data" );
const storage = require( "./storage/file/storage" )( data );

// series
const localContextMap = process.env.USE_LOCAL_CONTEXT && buildLocalContextMap();

const series = require( "./series" )( { storage, context, localContextMap } );
const commandProcessor = require( "./command-processor" )( { series, localContextMap } );
const { commandTypes, batchKeys } = require( "./command-processor" );

const baseNamespace = "https://app.openteamspace.com";
const simpleTeamsContext = {

    commands: batchKeys.commands,
    series: batchKeys.series,
    props: batchKeys.props,
    keys: batchKeys.keys,
    values: batchKeys.values,
    base: batchKeys.base,
    items: batchKeys.items,
    options: batchKeys.options,
    type: batchKeys.type,
    ns: batchKeys.ns

};

/*

    The purpose of this command processor is to take batches of commands for a series containing specific mutations and to process them, returning the resulting series

*/

async function createSeries( options, props, items ) {

    const series = await commandProcessor.process( [ {

        "@context": [ context, simpleTeamsContext ],
        commands: [ {

            "@type": commandTypes.create,
            props,
            options,
            items

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

async function withCommandBatch( series, commands, wrapped ) {

    const { "@id": seriesId } = series;
    const updated = await commandProcessor.process( {

        "@context": [ context, simpleTeamsContext ],
        series: {

            "@id": seriesId,
            base: baseNamespace

        },
        commands

    } );
    await wrapped( updated );

}

runTests( "Command receiver tests", {

    async CreateASeriesWithSomeProperties() {

        await withCreatedTeamSeries( "Team Zero", async series => {

            assert.strictEqual( series[ "@id" ].substring( 0, baseNamespace.length + 1 ), `${baseNamespace}/` );
            assert.strictEqual( series[ "http://schema.org/name" ], "Team Zero" );

        } );

    },

    async CreateASeriesThenAddUpdateAndRemoveSomeProperties() {

        await withCreatedTeamSeries( "Team One", async series => {

            const commands = [ {

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

            } ];
            await withCommandBatch( series, commands, async updated => {

console.log( updated );
                assert.strictEqual( updated[ "http://schema.org/name" ], "SJGR" );
                assert.strictEqual( updated[ "https://vocab.openteamspace.com/age" ], undefined );
                assert.strictEqual( updated[ "https://vocab.openteamspace.com/sex" ], "Female" );

            } );

        } );

    },

    async CreateASeriesWithSomeItems() {

        await withCreatedTeamSeries( "Team Zero", async series => {

            const commands = [ {

                "@type": commandTypes.setItems,
                items: [ {

                    "name": "oranges",
                    "count": 59

                }, {

                    "name": "apples",
                    "count": 576

                } ]

            } ];
            await withCommandBatch( series, commands, async updated => {

//console.log( JSON.stringify( updated, null, 3 ) );
                throw new Error( "Not yet implemented" );

            } );

        } );

    },

    async CreateASeriesWithSomeItemsThenAddUpdateAndRemoveThen() {

        return "pending";

    },

    async CreateASeriesThenCreateANestedSeriesWithSomePropertiesAndSomeItemsThenAddUpdateAndRemoveSomePropertiesAndAddUpdateAndRemoveSomeItems() {

        return "pending"

    }

} );