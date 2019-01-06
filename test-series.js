const { join } = require( "path" );
const assert = require( "assert" );
const data = join( __dirname, "data" );
const storage = require( "./storage/file/storage" )( data );
const { Group } = require( "./series/Group" )( storage );

async function run() {

    const details = { name: "The non starters" };
    const team = new Group( details );
    try {

        // group: create, save
        assert.deepStrictEqual( details.name, team.get( "name" ) );
        await team.save();
        const team2 = await Group.load( team.id );
        assert.deepStrictEqual( team2.get( "name" ), team.get( "name" ) );
        console.log( "OK create and save grouping with details" );

        // series: create, save, load, reload, get, set
        const members = await team.createSeries( "members" );
        const andrew = await members.create( { "name": "Andrew", "age": 42 } );
        const sj = await members.create( { "name": "Sarah-Jane", "age": 40 } );
        const ruby = await members.create( { "name": "Ruby" } );
        await members.save();
        const alsoMembers = await team.loadSeries( "members" );
        const alsoAndrew = await alsoMembers.get( andrew.id );
        assert.deepStrictEqual( [ alsoAndrew.name, alsoAndrew.age ], [ andrew.name, andrew.age ] );

        const alsoRuby = await alsoMembers.get( ruby.id );
        assert( alsoRuby );

        await members.remove( ruby );
        await members.save();
        const withoutRuby = await team.loadSeries( "members" );
        const alsoSJ = await withoutRuby.get( sj.id );
        assert.deepStrictEqual( [ alsoSJ.name, alsoSJ.age ], [ sj.name, sj.age ] );

        const notRuby = await withoutRuby.get( ruby.id );
        assert( !notRuby );

        alsoAndrew.name = "Roofus";
        await alsoMembers.set( alsoAndrew );
        await alsoMembers.save();

        const newMembers = await team.loadSeries( "members" );
        const newAndrew = await newMembers.get( andrew.id );
        assert.deepStrictEqual( [ newAndrew.name, newAndrew.age ], [ alsoAndrew.name, alsoAndrew.age ] );

        await alsoMembers.delete();
        const notMembers = await team.loadSeries( "members" );
        assert( !notMembers );

        console.log( "OK create, save, load series, delete items" );

    } catch( err ) {

        console.error( err );

    } finally {

        await team.delete();

    }

}

run();