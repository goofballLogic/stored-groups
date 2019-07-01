import data from "../data/idb";

export default {

    run( options ) {

        const user = { id: "test-user" };
        options.window = window;
        options.storeName = options.storeName || "static-idb";
        data.configure( options );
        data.login( user );

    }

};