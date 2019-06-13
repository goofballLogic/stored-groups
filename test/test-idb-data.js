import store from "../src/data/idb";

( async function() {

    store.configure( {

        storeName: "idb-test",
        window: window

    } );
    await store.purgeForUser( { username: "me" } );

    require( "../src/data/data-acceptance-tests" )( store ).then(

        () => console.log( "done" )

    );

}() );