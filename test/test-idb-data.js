import store from "../src/data/idb";

store.configure( {

    storeName: "idb-test",
    window: window

} );

require( "../src/data/data-acceptance-tests" )( store ).then(

    () => console.log( "done" )

);