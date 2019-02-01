const dateid = require( "./dateid" );
const { isAbsoluteUri, pathOf } = require( "./uri" );
const { expand, compact } = require( "jsonld" );
const DOC = Symbol( "doc" );
const OPTIONS = Symbol( "options" );
const BASE = Symbol( "base" );

const clone = x => ( x && typeof x === "object" || typeof x === "function" ) ? JSON.parse( JSON.stringify( x ) ) : x;

function squash( node ) {

    const squashed = clone( node );
    const type = node[ "@type" ];
    if ( type ) {

        delete squashed[ "@type" ];
        squashed.type = type;

    }
    const id = node[ "@id" ];
    if ( id ) {

        delete squashed[ "@id" ];
        squashed.id = id;

    }
    return squashed;

}

class Series {

    /*
        @param {Object} options - where:
            base: a base URL for all relative ids in this document
            ns: a namespace in which to generate ids
            name: a name to use to generate the id (autogenerated if not supplied)
    */
    constructor( options ) {

        if ( !options.storage ) throw new Error( "No storage provided" );
        options = { ...options };
        this[ OPTIONS ] = options;

        if ( options.base && !options.base.endsWith( "/" ) ) options.base = options.base + "/";

        const context = options.base
            ? [].concat( options.context, { "@base": options.base } ).filter( x => x )
            : options.context;

        let id = options.name || dateid();
        if ( options.ns ) id = `${options.ns}/${id}`;
        if ( !isAbsoluteUri( id ) ) id = `${options.base}/${id}`;
        if ( options.base && id.startsWith( options.base ) ) id = id.substring( options.base.length + 1 );

        this[ BASE ] = options.base;

        delete options.ns;
        delete options.name;
        delete options.base;

        this[ DOC ] = options.details || {

            "@context": context,
            "@id": id,
            "@type": options.type ? [ "Series" ].concat( options.type ) : [ "Series" ]

        };
        delete options.details;

    }

    // ids
    get id() {

        const rawId = this[ DOC ][ "@id" ];
        const base = this[ BASE ];
        const id = base ? `${base}${rawId}` : rawId;
        return pathOf( id ).substring( 1 );

    }

    // types
    get type() {

        return clone( this[ DOC ][ "@type" ] );

    }

    // top level props
    set( termOrHash, value ) {

        if ( !termOrHash ) return;
        if ( typeof termOrHash === "object" ) {

            const hash = termOrHash
            for( const term in hash ) {

                this.set( term, hash[ term ] );

            }

        } else {

            const term = termOrHash;
            if ( term.startsWith( "@" ) ) throw new Error( "Terms must not start with @" );
            this[ DOC ][ term ] = clone( value );

        }

    }

    get( term ) {

        return this[ DOC ][ term ];

    }

    // data index
    removeData( itemOrId ) {

        const id = typeof itemOrId === "object" ? itemOrId.id : itemOrId;
        const index = this[ DOC ].index;
        if ( index && ( id in index ) ) {

            const removed = index[ id ];
            delete index[ id ];
            return removed;

        }

    }

    data( optionsOrId ) {

        if ( typeof optionsOrId === "object" ) {

            const options = optionsOrId;

            const id = options.id || ( options.ns ? `${options.ns}/${dateid()}` : dateid() );
            const node = {

                ...( options.type ? { "@type": options.type } : {} ),
                ...options

            };

            delete node.type;
            delete node.ns;
            delete node.id;

            const index = this[ DOC ].index || {};
            this[ DOC ].index = index;
            index[ id ] = node;

            return squash( { id, ...node } );

        } else {

            const id = optionsOrId;

            const index = this[ DOC ].index;
            if ( !index ) return undefined;

            const item = index[ id ];
            if ( !item ) return undefined;

            return squash( { id, ...item } );

        }

    }

    // operations
    async save() {

        let bucket = this[ OPTIONS ].storage;
        const names = this.id.split( "/" );
        for( const name of names ) {

            bucket = await bucket.bucket( name );

        }
        const details = await bucket.item( "details" );
        await details.content( this[ DOC ] );

    }

    async export() {

        return await compact(

            await expand( this[ DOC ] ),
            {}

        );

    }

    createSeries( options ) {

        const hostOptions = this[ OPTIONS ];
        options = { ...options };
        if ( !( isAbsoluteUri( options.ns ) || options.base ) ) {

            const hostId = this.id;
            if ( isAbsoluteUri( hostId ) ) {

                options.base = hostId;

            } else {

                const hostContext = [].concat( this[ DOC ][ "@context" ] );
                const hostBase = hostContext[ 1 ] && hostContext[ 1 ][ "@base" ];
                if ( !hostBase ) throw new Error( `Malformed container - neither base nor id are absolute URIs. Base: ${hostBase}. Id: ${hostId}.` );
                options.base = `${hostBase}${hostId}`;

            }

        }
        return new Series( { ...hostOptions, ...options } );

    }

    static async resolveBucket( options ) {

        if ( !options.id ) throw new Error( "No id specified" );
        let bucket = await options.storage;
        for( const name of options.id.split( "/" ) )
            bucket = await bucket.bucket( name );
        return bucket;

    }

    static async load( options ) {

        const bucket = await Series.resolveBucket( options );
        if ( !( await bucket.exists() ) ) return undefined;
        const detailsItem = await bucket.item( "details" );
        const details = await detailsItem.content();
        return new Series( { ...options, details } );

    }

    static async delete( options ) {

        const bucket = await Series.resolveBucket( options );
        await bucket.delete();

    }

}

module.exports = function( options ) {

    if ( !( options && options.storage && options.context ) )
        throw new Error( "Invalid options supplied. Expected storage, context (uri)" );
    return {

        createSeries: seriesOptions => new Series( { ...seriesOptions, ...options } ),
        loadSeries: id => Series.load( { id, ...options } ),
        deleteSeries: id => Series.delete( { id, ...options } )

    };

};
