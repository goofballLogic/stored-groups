module.exports = {

    runTests,
    runTestsSequentially

};

const listTests = fixture => Object.keys( fixture ).filter( x => typeof fixture[ x ] === "function" );

async function execute( fixture, key ) {

    try {

        await fixture[ key ]();
        console.log( `OK ${key}` );
        return true;

    } catch( err ) {

        console.error( `ERROR ${key}\n${err.stack}` );

    }

}

async function runTestsSequentially( fixtureName, fixture ) {

    console.log( fixtureName, "\n" );
    for( var key of listTests( fixture ) ) {

        await execute( fixture, key );

    }

}

function runTests( fixtureName, fixture ) {

    console.log( fixtureName, "\n" );
    Promise
        .all( listTests( fixture ).map( async key => execute( fixture, key ) ) )
        .then( results => {

            if ( results.some( ok => !ok ) ) process.exit( 1 );

        } );

}