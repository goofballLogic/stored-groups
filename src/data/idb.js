const { initialize } = require( "../domain" );

import { Store, set } from "idb-keyval";

function series( store ) {


}

function schemaLoader() {

}

let options;

export default {

    configure( overrideOptions ) {

        if ( overrideOptions ) {

            options = Object.assign( options || {}, overrideOptions );

        } else {

            options = overrideOptions;

        }

    },

    async login( user ) {

        const storeName = options.storeName || "teams";
        const store = new Store( "tc2-simple-teams", storeName );
        const teamsSeries = series( store );
        const next = ( options && options.initialize ) || initialize;
        next( { user, root: teamsSeries, schemaLoader } )

    }

};