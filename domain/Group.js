const Command = require( "./Command" );
const dateid = require( "./dateid" );

const groupDetailsSymbol = Symbol( "Group details" );
const persistedGroupDetailsSymbol = Symbol( "Group details persisted" );

const clone = x => JSON.parse( JSON.stringify( x ) );

function createNamedMapItem( site, mapName, details ) {

    const { name } = details;
    if ( !name ) throw new Error( "No name specified" );
    const id = details.id || dateid();
    const item = { ...details };
    delete item.id;
    const map = site[ mapName ] || {};
    site[ mapName ] = map;
    if ( id in map ) throw new Error( "Item already exists" );
    map[ id ] = item;
    return { ...item, id };

}

module.exports = class Group {

    constructor( bucket, details, isPersisted = false ) {

        this.bucket = bucket;
        this[ groupDetailsSymbol ] = details || {};
        this[ persistedGroupDetailsSymbol ] = isPersisted ? clone( details ) : {};

    }

    createSeries( details ) {

        return createNamedMapItem( this[ groupDetailsSymbol ], "series", details );

    }

    createMember( details ) {

        return createNamedMapItem( this[ groupDetailsSymbol ], "members", details );

    }

    async updateTimeSeries( series, when, details ) {

        when = Number( when );
        const { id } = series;
        const { series: seriesMap } = this[ persistedGroupDetailsSymbol ];
        if ( !( seriesMap && id in seriesMap ) )
            throw new Error( "Series doesn't exist. Did you forget to save the Group first?" );
        const year = ( new Date( when ) ).getUTCFullYear();
        const item = await this.bucket.item( `${id}_${year}` );
        await item.replacePropertyValue( when, details );
        return ( await item.content() )[ when ];

    }

    async queryTimeSeries( series, min, max ) {

        const { id } = series;
        const { series: seriesMap } = this[ persistedGroupDetailsSymbol ];
        if ( !( seriesMap && id in seriesMap ) )
            return undefined;
        const minYear = ( new Date( min ) ).getUTCFullYear();
        const maxYear = ( new Date( max ) ).getUTCFullYear();
        const items = [];
        for( var year = minYear; year <= maxYear; year++ ) {

            items.push( this.bucket.item( `${id}_${year}` ) );

        }
        const yearItems = await Promise.all( items );
        const yearData = await Promise.all( yearItems.map( item => item.content() ) );
        const results = {};
        for( var year of yearData ) {

            for( var when in year ) {

                when = Number( when );
                if ( when < min ) continue;
                if ( when > max ) continue;
                results[ when ] = year[ when ];

            }

        }
        return results;

    }

    get id() {

        return this.bucket.name;

    }

    get name() {

        return this[ groupDetailsSymbol ].name;

    }

    setValue( key, value ) {

        const details = this[ groupDetailsSymbol ];
        details.values = { ...details.values, [ key ]: value };

    }

    getValue( key ) {

        const details = this[ groupDetailsSymbol ];
        return details.values && details.values[ key ];

    }

    get members() {

        return clone( this[ groupDetailsSymbol ].members || {} );

    }

    get deleteCommand() {

        return new Command( "DELETE_TEAM", `Delete team: ${this.name}`, async () => {

            this.bucket.delete();

        } );

    }

    get saveCommand() {

        return new Command( "SAVE_TEAM", `Save team: ${this.name}`, async () => {

            const details = await this.bucket.item( "details" );
            await details.content( this[ groupDetailsSymbol ] );
            this[ groupDetailsSymbol ] = await details.content();
            this[ persistedGroupDetailsSymbol ] = clone( this[ groupDetailsSymbol ] );

        } );

    }

    static async load( bucket ) {

        let content;
        try {

            const details = await bucket.item( "details" );
            content = await details.content();

        } catch( err ) {

            console.warn( `Error loading group ${bucket.name}: ${err.stack}` );
            content = {};

        }
        return new Group( bucket, content, true );

    }

};