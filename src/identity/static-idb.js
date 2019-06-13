import data from "../data/idb";

export default {

    run( storeName = "static-idb" ) {

        const user = { id: "test-user" };
        const options = { storeName, window };
console.log( options );
        data.configure( options );
        data.login( user );

    }

};