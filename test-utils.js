module.exports = {

    runTests,
    runTestsSequentially

};

const listTests = fixture => Object.keys( fixture ).filter( x => typeof fixture[ x ] === "function" );

function emitTitle( title ) {

    console.log( "" );
    console.log( title, "\n" );

}

async function execute( fixture, key ) {

    try {

        const result = await fixture[ key ]();
        console.log( `${result === "pending" ? "~~" : "OK"} ${key}` );
        return true;

    } catch( err ) {

        console.error( `ERROR ${key}\n${err.stack}` );

    }

}

async function runTestsSequentially( fixtureName, fixture ) {

    emitTitle( fixtureName );
    for( var key of listTests( fixture ) ) {

        await execute( fixture, key );

    }

}

function runTests( fixtureName, fixture ) {

    emitTitle( fixtureName );
    Promise
        .all( listTests( fixture ).map( async key => execute( fixture, key ) ) )
        .then( results => {

            if ( results.some( ok => !ok ) ) process.exit( 1 );

        } );

}