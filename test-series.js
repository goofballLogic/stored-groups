const { join } = require( "path" );
const assert = require( "assert" );
const data = join( __dirname, "data" );
const storage = require( "./storage/file/storage" )( data );
const { Group } = require( "./series/Group" )( storage );

async function run() {

    // create team with details
    const details = { name: "The non starters" };
    const team = new Group( details );
    assert.deepStrictEqual( details.name, team.get( "name" ) );
    await team.save();

    try {

        // load team
        const team2 = await Group.load( team.id );
        assert.deepStrictEqual( team2.get( "name" ), team.get( "name" ) );
        console.log( "OK create and save grouping with details" );

        // create a members series in the team and add some members
        const members = await team.createSeries( "members" );
        const andrew = await members.create( { "name": "Andrew", "age": 42 } );
        const sj = await members.create( { "name": "Sarah-Jane", "age": 40 } );
        const ruby = await members.create( { "name": "Ruby" } );

        // save the series
        await members.save();

        // reload the created series and check the data is there
        const alsoMembers = await team.loadSeries( "members" );
        const alsoAndrew = await alsoMembers.get( andrew.id );
        assert.deepStrictEqual( [ alsoAndrew.name, alsoAndrew.age ], [ andrew.name, andrew.age ] );

        // retrieve an item from the reloaded series
        const alsoRuby = await alsoMembers.get( ruby.id );
        assert( alsoRuby );

        // remove it from the first series and save
        await members.remove( ruby );
        await members.save();

        // reload the series without the removed item
        const withoutRuby = await team.loadSeries( "members" );

        // check data survived to this third version of the series
        const alsoSJ = await withoutRuby.get( sj.id );
        assert.deepStrictEqual( [ alsoSJ.name, alsoSJ.age ], [ sj.name, sj.age ] );

        // check the removed item stayed removed
        const notRuby = await withoutRuby.get( ruby.id );
        assert( !notRuby );

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

        //await team.delete();

    }

}

run();