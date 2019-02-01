const dateid = require( "./dateid" );
const { expand, compact } = require( "jsonld" );
const DOC = Symbol( "doc" );
const OPTIONS = Symbol( "options" );

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

    constructor( options ) {

        if ( !options.storage ) throw new Error( "No storage provided" );
        this[ OPTIONS ] = options;
        this[ DOC ] = options.details  || {

            "@context": options.context,
            "@id": options.id || dateid(),
            "@type": options.type ? [ "Series" ].concat( options.type ) : [ "Series" ]

        };

    }

    set( term, value ) {

        this[ DOC ][ term ] = clone( value );

    }

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

            const ns = options.ns || "data";
            const id = options.id || `${ns}/${dateid()}`;
            const type = options.type || undefined;

            const node = {};
            if( type ) { node[ "@type" ] = type; }
            Object.assign( node, options );
            delete node.ns;
            delete node.id;
            delete node.type;

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

    get( term ) {

        return this[ DOC ][ term ];

    }

    get id() {

        return this[ DOC ][ "@id" ];

    }

    get type() {

        return clone( this[ DOC ][ "@type" ] );

    }

    async save() {

        const bucket = await this[ OPTIONS ].storage.bucket( this.id );
        const details = await bucket.item( "details" );
        await details.content( this[ DOC ] );

    }

    async export() {

        return await compact(

            await expand( this[ DOC ] ),
            {}

        );

    }

    static async load( options ) {

        if ( !options.id ) throw new Error( "No id specified" );
        const bucket = await options.storage.bucket( options.id );
        if ( !( await bucket.exists() ) ) return undefined;
        const detailsItem = await bucket.item( "details" );
        const details = await detailsItem.content();
        return new Series( { ...options, details } );

    }

    static async delete( options ) {

        if ( !options.id ) throw new Error( "No id specified" );
        const bucket = await options.storage.bucket( options.id );
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
