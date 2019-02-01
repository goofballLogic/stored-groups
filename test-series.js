const assert = require( "assert" );

const { join } = require( "path" );
const data = join( __dirname, "data" );
const storage = require( "./storage/file/storage" )( data );

const context = [

    "https://raw.githubusercontent.com/goofballLogic/stored-groups/master/design/things/context.jsonld",
    { "@base": "https://app.openteamspace.com/teams/" }

];
const { createSeries, loadSeries } = require( "./series" )( { storage, context } );

async function run() {

    // create team with details
    const name = "The non starters";
    const team = createSeries( { type: [ "Team" ] } );
    team.set( "name", name );
    assert.deepStrictEqual( team.get( "name" ), name );
    assert.deepStrictEqual( team.type, [ "Series", "Team" ] );
    assert.deepStrictEqual(

        ( await team.export() )[ "@type" ],
        [ "https://vocab.openteamspace.com#Series", "https://vocab.openteamspace.com#Team" ]

    )

    try {

        // load team
        await team.save();
        const team2 = await loadSeries( team.id );
        assert.deepStrictEqual( team2.get( "name" ), team.get( "name" ) );
        console.log( "OK create and save series with details" );

        // add members to the team
        const pattern = { "ns": "members", type: "Pesron" };
        const andrew = team.data( { ...pattern, "givenName": "Andrew", "familyName": "Gibson", "jobTitle": "Principal Engineer" } );
        const sj = team.data( { ...pattern, "givenName": "Sarah-Jane", "familyName": "Gibson", "jobTitle": "Ethnomusicologist" } );
        const ruby = team.data( { ...pattern, "givenName": "Ruby", "familyName": "Tuesday" } );

        // save the series
        await team.save();

        // reload the created series and check the data is there
        const team3 = await loadSeries( team.id );
        const alsoAndrew = team3.data( andrew.id );
        assert.deepStrictEqual( [ alsoAndrew.givenName, alsoAndrew.firstName ], [ andrew.givenName, andrew.firstName ] );

        console.log( "OK add, save and reload series data items" );

        // retrieve an item from the reloaded series
        const alsoRuby = team3.data( ruby.id );
        assert( alsoRuby );

        // remove it from the first series and save
        await team.removeData( ruby );
        await team.save();

        // reload the series without the removed item
        const team4 = await loadSeries( team.id );

        // check data survived to this fourth version of the series
        const alsoSJ = team4.data( sj.id );
        assert.deepStrictEqual( [ alsoSJ.givenName, alsoSJ.jobTitle ], [ sj.givenName, sj.jobTitle ] );

        // check the removed item stayed removed
        const notRuby = team4.data( ruby.id );
        assert( !notRuby );

        console.log( "OK remove item from series" );

return;

        // update the content of an item, set it back to the series and save
        alsoAndrew.name = "Roofus";
        await alsoMembers.set( alsoAndrew );
        await alsoMembers.save();

        // reload the series again and compare the before and after versions of the changed item
        const newMembers = await team.loadSeries( "members" );
        const newAndrew = await newMembers.get( andrew.id );
        assert.deepStrictEqual( [ newAndrew.name, newAndrew.age ], [ alsoAndrew.name, alsoAndrew.age ] );

        // delete the series and attempt to load it
        await alsoMembers.delete();
        const notMembers = await team.loadSeries( "members" );
        assert( !notMembers );

        console.log( "OK create, save, load series, delete items" );

        // create scores menu
        const measurements = await team.createSeries( "measurements" );
        const positivity = await measurements.create( {

            "name": "Positivity",
            "description": "Having a positive attitude",
            "measurement": "Did the person's attitude have a particularly positively affect on other team members?",
            "scores": [ 4, 0 ]

        } );
        const timeliness = await measurements.create( {

            "name": "Timelineness",
            "description": "Completing work on or close to the estimated time",
            "measurement": "Did the person complete their work within 1 day or 10% of the original estimate (whichever is greater)",
            "scores": [ 1, -4 ]

        } );
        await measurements.save();
        console.log( "OK create series (scores)" );

        // recreate the members series
        await members.save();
        console.log( "OK recreate series (members)" );

        // create metrics time series
        const oneYear = ( Date.UTC( 2018, 1, 1 ) - Date.UTC( 2014, 1, 1 ) ) / 4;
        const metrics = await team.createIndexedSeries( "metrics", oneYear );
        const andrewSmiled = {

            "score": 4,
            "description": "Andrew smiled a lot",
            "dimensions": [ {

                "@type": "member",
                ...andrew

            }, {

                "@type": "measurement",
                ...positivity

            } ]

        };
        await metrics.addAt( Date.UTC( 2018, 1, 6 ), andrewSmiled );
        const alsoAndrewSmiled = await metrics.get( Date.UTC( 2018, 1, 6 ) );
        assert.deepStrictEqual( alsoAndrewSmiled, [ andrewSmiled ] );
        console.log( "OK add value(s) at index point (date value for time series)" );

    } catch( err ) {

        console.error( err );

    } finally {

        //console.log( JSON.stringify( await team.export() ) );
        //await team.delete();

    }

}

run();