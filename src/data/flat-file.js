const { join } = require( "path" );
const { load, save, purgeFolder } = require( "./flat-file-operations" );
const { initialize } = require( "../domain" );
const schemaLoader = require( "./schemaLoader" );

function series( folder ) {

    const valuesPath = join( folder, "./values.json" );
    const indexPath = join( folder, "./index.json" );

    function decorateIndex( index ) {

        Object.entries( index ).forEach( ( [ key, values ] ) => {

            values.go = () => series( join( folder, key ) );

        } );

    }

    return {

        async values() {

            const values = await load( valuesPath );
            return values || null;

        },

        async setValues( hash ) {

            const values = await load( valuesPath );
            if ( !hash ) return values;

            const updated = { ...values, ...hash };
            return ( await save( updated, valuesPath ) );

        },

        async removeValues( keys ) {

            const values = await load( valuesPath );
            if ( !values ) return values;
            if ( !( keys && keys.length ) ) return values;

            keys.forEach( key => values[ key ] = undefined );
            return await save( values, valuesPath );

        },

        async addToIndex( hash ) {

            if ( !( hash && typeof hash === "object" ) ) throw new Error( `Invalid key-value pairs to index: ${hash}` );
            const index = await load( indexPath ) || {};
            Object.entries( hash ).forEach( ( [ key, value ] ) => {

                if ( key in index ) throw new Error( `Key already exists in this index: ${key}` );
                index[ key ] = value;

            } );
            const updated = await save( index, indexPath );
            decorateIndex( updated );
            return updated;

        },

        async removeFromIndex( keys ) {

            const index = await load( indexPath );
            if ( !( keys && keys.length ) ) return index;
            if ( !Array.isArray( keys ) ) keys = [ keys ];
            await Promise.all( keys.map( async key => {

                if ( key in index ) index[ key ] = undefined;
                await purgeFolder( join( folder, `./${key}` ) );

            } ) );
            const updated = await save( index, indexPath );
            decorateIndex( updated );
            return updated;

        },

        async index() {

            const index = await load( indexPath );
            if ( !index ) return null;
            decorateIndex( index );
            return index;

        }

    }

}

module.exports = {

    async login( user ) {

        const teamsFolder = join( __dirname, "../../data/teams" );
        const teamsSeries = series( teamsFolder );
        initialize( { user, root: teamsSeries, schemaLoader } );
        //require( "./flat-file-test" )( series );

    }

}