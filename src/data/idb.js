const { initialize } = require( "../domain" );
const schemaLoader = require( "./idb-schemaLoader" );

import { Store, set, get, clear, del } from "idb-keyval";

const makePath = ( prev, step ) => `${prev}/${step}`;

function series( store, namespace = "" ) {

    const indexPath = `${namespace}__index`;
    const valuesPath = `${namespace}__values`;

    function decorateIndex( index ) {

        Object.entries( index ).forEach( ( [ key, values ] ) => {

            values.go = () => series( store, makePath( namespace, key ) );

        } );

    }

    const loadIndex = async () => await get( indexPath, store );
    const saveIndex = async index => {

        await set( indexPath, index, store );
        return await loadIndex();

    };
    const delIndexed = async key => {

        await del( makePath( namespace, key ), store );
        return await loadIndex();

    };
    const loadValues = async () => await get( valuesPath, store );
    const saveValues = async values => {

        await set( valuesPath, values, store );
        return await loadValues();

    };

    return {

        async index() {

            const index = await loadIndex();
            if ( !index ) return null;
            decorateIndex( index );
            return index;

        },

        async addToIndex( hash ) {

            if ( !( hash && typeof hash === "object" ) ) throw new Error( `Invalid key-value pairs to index: ${hash}` );
            const index = ( await loadIndex() ) || {};
            Object.entries( hash ).forEach( ( [ key, value ] ) => {

                if ( key in index ) throw new Error( `Key already exists in this index: ${key}` );
                if ( typeof value !== "object" ) throw new Error( `Index value must be an object. ${key} is of type ${typeof value}: ${value}` );
                if ( !value ) throw new Error( `Index value must be truthy. ${key} is ${value}` );
                index[ key ] = value;

            } );
            const updated = await saveIndex( index );
            decorateIndex( updated );
            return updated;

        },

        async removeFromIndex( keys ) {

            const index = ( await loadIndex() ) || {};
            if ( !( keys && keys.length ) ) return index;
            if ( !Array.isArray( keys ) ) keys = Array.from( arguments );
            await Promise.all( keys.map( async key => {

                if ( key in index ) delete index[ key ];
                await delIndexed( key );

            } ) );
            const updated = await saveIndex( index );
            decorateIndex( updated );
            return updated;

        },

        async values() {

            const values = await loadValues();
            return values || null;

        },

        async setValues( hash ) {

            const values = await loadValues();
            if ( !hash ) return values;

            const updated = { ...values, ...hash };
            return await saveValues( updated );

        },

        async removeValues( keys ) {

            const values = await loadValues();
            if ( !values ) return values || null;
            if ( !( keys && keys.length ) ) return values;

            keys.forEach( key => { delete values[ key ]; } );
            return await saveValues( values );

        },


    };

}

let options;

const storeForUser = user => new Store(

    `tc2-simple-teams__${( user && user.username ) || "shared"}`,
    options.storeName || "teams"

);

export default {

    configure( overrideOptions ) {

        if ( overrideOptions ) {

            options = Object.assign( options || {}, overrideOptions );

        } else {

            options = overrideOptions;

        }

    },

    // test seam
    async purgeForUser( user ) {

        const store = storeForUser( user );
        await clear( store );

    },

    async login( user ) {

        const store = storeForUser( user );
window.i = { store, get, set };
        const teamsSeries = series( store );
        const next = ( options && options.initialize ) || initialize;
        next( {

            user,
            root: teamsSeries,
            schemaLoader,
            window: options.window

        } );

    }

};