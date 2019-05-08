const { join } = require( "path" );
const flatFileTestTeamsFolder = join( __dirname, "../../data/flat-file-test" );
const dateid = require( "../dateid" );

module.exports = async series => {

    const root = series( flatFileTestTeamsFolder );
    const teamsValues = await root.values();
    const teamsIndex = await root.index();

    console.log( teamsValues );
    console.log( teamsIndex );

    const team1 = Object.values( teamsIndex )[ 0 ].go();
    const team1Values = await team1.values();
    const team1Index = await team1.index();

    console.log( team1Values );
    console.log( team1Index );

    const team1Values1 = await team1.setValues( { size: 50, location: "16 Parade" } );
    console.log( team1Values1 );

    const team1Values2 = await team1.removeValues( [ "size", "location" ] );
    console.log( team1Values2 );

    const team1Members = team1Index.members.go();
    const team1MembersValues = await team1Members.values();
    console.log( team1MembersValues );

    const team1MembersValues1 = await team1Members.setValues( {

        [ dateid() ]: {

            familyName: "Gregory",
            givenName: "Bob",
            jobTitle: "Co-pilot"

        }

    } );
    console.log( team1MembersValues1 );

    const keysToRemove = Object
        .entries( team1MembersValues1 )
        .filter( ( [ key, value ] ) => value.jobTitle === "Co-pilot" )
        .map( ( [ key ] ) => key );
    const team1MembersValues2 = await team1Members.removeValues( keysToRemove );
    console.log( team1MembersValues2 );

    if ( "foos" in team1Index ) {

        await team1.removeFromIndex( [ "foos" ] );

    }

    const team1Index2 = await team1.addToIndex( { "foos": { "name": "The foos" } } );
    console.log( team1Index2 );

    const foos = await team1Index2.foos.go();
    const foosValues = await foos.setValues( { foo: "bar" } );
    console.log( foosValues );

    const team1Index3 = await team1.removeFromIndex( "foos" );

}