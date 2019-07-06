const { join } = require( "path" );
const { load, save, purgeFolder } = require( "./flat-file-operations" );
const { initialize } = require( "../domain" );
const schemaLoader = require( "./schema-loader" );

function series( folder ) {

    const valuesPath = join( folder, "./values.json" );
    const indexPath = join( folder, "./index.json" );

    function decorateIndex( index ) {

        Object.entries( index ).forEach( ( [ key, values ] ) => {

            values.go = () => series( join( folder, key ) );

        } );

    }

    async function updateIndex( hash, allowUpdates = false) {

        if ( !( hash && typeof hash === "object" ) ) throw new Error( `Invalid key-value pairs to index: ${hash}` );
        const index = ( await load( indexPath ) ) || {};
        Object.entries( hash ).forEach( ( [ key, value ] ) => {

            if ( !allowUpdates && ( key in index ) ) throw new Error( `Key already exists in this index: ${key}` );
            if ( typeof value !== "object" ) throw new Error( `Index value must be an object. ${key} is of type ${typeof value}: ${value}` );
            if ( !value ) throw new Error( `Index value must be truthy. ${key} is ${value}` );
            index[ key ] = value;

        } );
        const updated = await save( index, indexPath );
        decorateIndex( updated );
        return updated;

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
            return await save( updated, valuesPath );

        },

        async removeValues( keys ) {

            const values = await load( valuesPath );
            if ( !values ) return values;
            if ( !( keys && keys.length ) ) return values;

            keys.forEach( key => values[ key ] = undefined );
            return await save( values, valuesPath );

        },

        async addToIndex( hash ) {

            return await updateIndex( hash );
        },

        async updateIndex( hash ) {

            return await updateIndex( hash, true );

        },

        async removeFromIndex( keys ) {

            const index = await load( indexPath );
            if ( !( keys && keys.length ) ) return index;
            if ( !Array.isArray( keys ) ) keys = Array.from( arguments );
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

        },

        async parent() {

            const newFolder = join( folder, ".." );
            if ( newFolder.length < options.folder.length ) return undefined;
            return series( newFolder );

        }

    }

}

let options = {

    folder: join( __dirname, "../../data/teams" )

};

module.exports = {

    configure( overrideOptions ) {

        options = Object.assign( options || {}, overrideOptions );

    },

    async login( user ) {

        const teamsFolder = options.folder;
        const teamsSeries = series( teamsFolder );
        const next = ( options && options.initialize ) || initialize;
        next( { user, root: teamsSeries, schemaLoader, options } );
        //require( "./flat-file-test" )( series );

    }

}