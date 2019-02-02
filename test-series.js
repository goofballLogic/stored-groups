const assert = require( "assert" );

const { join } = require( "path" );
const data = join( __dirname, "data" );
const storage = require( "./storage/file/storage" )( data );

const context = "https://raw.githubusercontent.com/goofballLogic/stored-groups/master/design/things/context.jsonld";
const baseNamespace = "https://app.openteamspace.com";

const {

    createSeries,
    loadSeries,
    deleteSeries

} = require( "./series" )( { storage, context } );

async function run() {

    console.log( "\nSeries tests\n" );

    // create team with details
    const name = "The non starters";
    const team = createSeries( {

        type: "Team",
        "ns": "teams",
        "base": baseNamespace

    } );
    team.set( "name", name );
    team.set( {

        "color": "#FF0044",
        "logo": "http://app.openteamspace.com/img/triangular.png"

    } );
    assert.deepStrictEqual( team.get( "name" ), name );
    assert.deepStrictEqual( team.type, [ "Series", "Team" ] );
    assert.deepStrictEqual( team.get( "logo" ), "http://app.openteamspace.com/img/triangular.png" );
    const teamExport = await team.export();
    assert.deepStrictEqual(

        teamExport[ "@type" ],
        [ "https://vocab.openteamspace.com/Series", "https://vocab.openteamspace.com/Team" ]

    )
    assert.deepStrictEqual(

        teamExport[ "@id" ],
        `${baseNamespace}/${team.id}`

    );

    try {

        // load team
        await team.save();
        const team2 = await loadSeries( team.id );
        assert.deepStrictEqual( team2.get( "name" ), team.get( "name" ) );
        console.log( "OK create and save series with details" );

        // add members to the team
        const pattern = {

            "ns": "people",
            type: "Person"

        };
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

        // update the content of an item, set it back to the series and save
        alsoAndrew.givenName = "Roofus";
        team4.data( alsoAndrew );
        await team4.save();

        // reload the series again and compare the before and after versions of the changed item
        const team5 = await loadSeries( team.id );
        const newAndrew = team5.data( andrew.id );
        assert.deepStrictEqual( [ newAndrew.givenName, newAndrew.familyName ], [ alsoAndrew.givenName, alsoAndrew.familyName ] );

        console.log( "OK update an item and save in series" );

        // delete the series and attempt to load it
        await deleteSeries( team5.id );
        const notMembers = await loadSeries( team5.id );
        assert.strictEqual( notMembers, undefined );

        console.log( "OK delete series" );

        // create scores menu
        const measurements = await team.createSeries( {

            type: "Measurements",
            name: "measurements"

        } );
        const measurementsURI = ( await measurements.export() )[ "@id" ];
        assert.strictEqual( measurementsURI,`${baseNamespace}/${team.id}/measurements` );
        console.log( "OK created nested data series" );

        const positivity = measurements.data( {

            "ns": "mesurements",
            "name": "Positivity",
            "description": "Having a positive attitude",
            "measurement": "Did the person's attitude have a particularly positively affect on other team members?",
            "scores": [ 4, 0 ]

        } );
        const timeliness = measurements.data( {

            "ns": "mesurements",
            "name": "Timelineness",
            "description": "Completing work on or close to the estimated time",
            "measurement": "Did the person complete their work within 1 day or 10% of the original estimate (whichever is greater)",
            "scores": [ 1, -4 ]

        } );
        await measurements.save();
        console.log( "OK create series (measurements)" );

        // recreate the members series
        await team.save();
        console.log( "OK recreate series (members)" );

        // create goals series
        const goals = team.createSeries( { name: "goals" } );
        goals.save();

    } catch( err ) {

        console.error( err );

    } finally {

        //console.log( JSON.stringify( await team.export() ) );
        //await team.delete();

    }

}

run();