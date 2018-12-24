const { join } = require( "path" );
const data = join( __dirname, "data" );
const storage = require( "./storage" )( data );
const { listGroups, createGroup } = require( "./domain" )( storage );

async function run() {

    const groups = await listGroups();
    console.log( groups.map( g => `${g.name} (${g.id})` ) );
    const cteam = await createGroup( { name: "It's the C team but we're lovely people!" } );
    console.log( cteam.id, cteam.name );
    try {

        const andrew = await cteam.createMember( { name: "Andrew" } );
        andrew.logo = "http://whatever.com/thing.jpg";
        const members = cteam.members;
        console.log( members );
        console.log( "Andrew created" );

        const scores = cteam.createSeries( { name: "scores" } );
        console.log( "Series created:" );
        console.log( scores );

        console.log( await cteam.saveCommand.invoke() );

        const when = Date.UTC( 2018, 03, 27 );
        const seriesData = await cteam.updateTimeSeries( scores, when, [

            { member: { id: andrew.id }, tag: "age", value: 27 },
            { member: { id: andrew.id }, tag: "colour", value: "#77BBFF" }

        ] );
        console.log( "Time series updated with data points:" );
        console.log( JSON.stringify( seriesData, null, 3 ) );

    } catch( err ) {

        console.warn( err );

    } finally {

        console.log( await cteam.deleteCommand.invoke() );

    }

}

run();