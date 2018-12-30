const { join } = require( "path" );
const assert = require( "assert" );
const data = join( __dirname, "data" );
const storage = require( "./storage/file/storage" )( data );
const { listGroups, createGroup } = require( "./domain" )( storage );

async function run() {

    // list available groups
    const groups = await listGroups();
    assert.deepStrictEqual(
        [ 'The B sides (1234_asdf)', 'The A team! (2345_qwer)' ],
        groups.map( g => `${g.name} (${g.id})` )
    );
    console.log( "OK list teams using listGroups" );

    // create a new group
    const cteam = await createGroup( { name: "It's the C team but we're lovely people!" } );

    try {

        assert.strictEqual( "It's the C team but we're lovely people!", cteam.name );
        assert( /^\d{13}_.{9}$/.test( cteam.id ), `Unexpected id format: ${cteam.id}` );
        console.log( "OK create team using createGroup" );

        // create team member andrew
        const andrew = await cteam.createMember( { name: "Andrew" } );
        console.log( "OK create team member using createMember" );

        // add a logo property
        andrew.logo = "http://whatever.com/thing.jpg";

console.log( JSON.stringify( andrew ) );
console.log( JSON.stringify( cteam.members ) );
throw new Error();
        // list team members
        const members = cteam.members;
        console.log( members );

        // create a data series named "scores"
        const scores = cteam.createSeries( { name: "scores" } );
        console.log( "Series created:" );
        console.log( scores );

        // set the value of the team "logo"
        cteam.setValue( "logo", "http://www.stuff.com/img.png" );
        console.log( cteam );

        // save changes to this team
        console.log( await cteam.saveCommand.invoke() );

        // set the data for a particular time of a series
        const whenData = await cteam.updateTimeSeries( scores, Date.UTC( 2018, 03, 27 ), [

            { member: { id: andrew.id }, tag: "size", value: 27 },
            { member: { id: andrew.id }, tag: "colour", value: "#77BBFF" }

        ] );
        console.log( "Time series updated with data points:" );
        console.log( JSON.stringify( whenData, null, 3 ) );

        const when2Data = await cteam.updateTimeSeries( scores, Date.UTC( 2016, 4, 6 ), [

            { member: { id: andrew.id }, tag: "size", value: 31 }

        ] );
        console.log( "Time series updated with data points:" );
        console.log( JSON.stringify( when2Data, null, 3 ) );

        const queryData = await cteam.queryTimeSeries( scores, Date.UTC( 2016, 0, 1 ), Date.UTC( 2019, 0, 1 ) - 1 );
        console.log( "Time series data in 2016-2018:" );
        console.log( queryData );

    } catch( err ) {

        console.warn( err );

    } finally {

        // delete the team
        console.log( await cteam.deleteCommand.invoke() );

    }

}

run();