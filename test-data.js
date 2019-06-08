const store = require( "./src/data/flat-file" );
const { join }  = require( "path" );

store.configure( {

    folder: join( __dirname, `./data/test/${Date.now()}` )

} );

require( "./src/data/data-acceptance-tests" )( store ).then(

    () => console.log( "done" )

);