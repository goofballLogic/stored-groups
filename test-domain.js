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
        const andrew = cteam.createMember( { name: "Andrew" } );
        console.log( "OK create team member using createMember" );

        // add a logo property
        const logo = "http://whatever.com/thing.jpg";
        const andrewUpdated = cteam.updateMember( andrew, { logo } );
        assert.strictEqual( andrewUpdated.logo, logo );
        console.log( "OK update team member adding property" );

        // add avatar property, remove logo property
        const andrewUpdated2 = cteam.updateMember( andrew, { avatar: logo, logo: undefined } );
        assert( !( "logo" in andrewUpdated2 ) );
        console.log( "OK update team member removing property" );

        // list team members
        const members = cteam.members;
        assert.deepStrictEqual( members, { [ andrew.id ]: { "name": "Andrew", avatar: logo } } );
        console.log( "OK list team members" );

        // create a data series named "scores"
        const scores = cteam.createSeries( { name: "scores" } );
        const series = cteam.series;
        assert.deepStrictEqual( series, { [ scores.id ]: { "name": "scores" } } );
        console.log( "OK series created" );

        // set the value of the team "logo"
        const teamLogo = "http://www.stuff.com/img.png";
        cteam.setValue( "logo", teamLogo );
        const values = cteam.values;
        assert.deepStrictEqual( values, { "logo": teamLogo } );
        console.log( "OK group property set" );

        // save changes to this team
        const saved = await cteam.saveCommand.invoke();
        assert( saved.completed );
        const cteamSavedThenLoaded = ( await listGroups() ).find( group => group.id === cteam.id );
        assert.deepStrictEqual( cteamSavedThenLoaded.values, cteam.values );
        assert.deepStrictEqual( cteamSavedThenLoaded.series, cteam.series );
        assert.deepStrictEqual( cteamSavedThenLoaded.members, cteam.members );
        console.log( "OK group save and reload" );

        // set the data for a particular time of a series (march 2018)
        const when1 = Date.UTC( 2018, 2, 27 );
        const data1 = [

            { member: { id: andrew.id }, tag: "size", value: 27 },
            { member: { id: andrew.id }, tag: "colour", value: "#77BBFF" }

        ];
        const updatedData1 = await cteam.updateTimeSeries( scores, when1, data1 );
        assert.deepStrictEqual( data1, updatedData1 );
        assert.notStrictEqual( data1, updatedData1 );
        console.log( "OK save timeseries data" );

        // add some more data (may 2016, june 1999)
        const when2 = Date.UTC( 2016, 4, 6 );
        const data2 = [

            { member: { id: andrew.id }, tag: "size", value: 31 }

        ]
        const when3 = Date.UTC( 1999, 5, 24 );
        const data3 = [ { member: { id: andrew.id }, tag: "size", value: 11 } ];

        await cteam.updateTimeSeries( scores, when2, data2 );
        await cteam.updateTimeSeries( scores, when3, data3 );

        const queryData = await cteam.queryTimeSeries( scores, Date.UTC( 2016, 0, 1 ), Date.UTC( 2019, 0, 1 ) - 1 );
        assert( when1 in queryData );
        assert( when2 in queryData );
        assert( !( when3 in queryData ) );
        assert.deepStrictEqual( queryData[ when1 ], data1 );
        assert.deepStrictEqual( queryData[ when2 ], data2 );
        console.log( "OK query time series by date range" );

    } catch( err ) {

        console.warn( err );

    } finally {

        // delete the team
        const deleted = await cteam.deleteCommand.invoke();
        assert( deleted.completed );
        console.log( "OK delete team" );

    }

}

run();