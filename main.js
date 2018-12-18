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
        console.log( andrew );
        console.log( andrew.id, andrew.name, andrew.details );
        const members = cteam.members;
        console.log( members );
        await cteam.saveCommand.invoke();

    } catch( err ) {

        console.warn( err );

    } finally {

        console.log( await cteam.deleteCommand.invoke() );

    }

}

run();