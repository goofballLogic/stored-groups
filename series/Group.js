const dateid = require( "./dateid" );

const ID = Symbol( "id" );
const DETAILS = Symbol( "details" );
const ITEMS = Symbol( "items" );
const GROUP = Symbol( "group" );

const clone = x => x && JSON.parse( JSON.stringify( x ) );

module.exports = storage => {

    class Series {

        constructor( group, id, items = {} ) {

            this[ ID ] = id;
            this[ GROUP ] = group;
            this[ ITEMS ] = { ...items };

        }

        get id() {

            return this[ ID ];

        }

        async get( itemId ) {

            return clone( this[ ITEMS ][ itemId ] );

        }

        async set( item ) {

            const { id } = item;
            item = clone( item );
            this[ ITEMS ][ id ] = item;

        }

        async remove( item ) {

            const { id } = item;
            delete this[ ITEMS ][ id ];

        }

        async create( details ) {

            const id = dateid();
            const item = { ...details, id };
            this[ ITEMS ][ item.id ] = item;
            return { ...item };

        }

        async delete() {

            const group = this[ GROUP ];
            const bucket = await storage.bucket( group.id );
            const item = await bucket.item( this[ ID ] );
            await item.delete();

        }

        async save() {

            const group = this[ GROUP ];
            const bucket = await storage.bucket( group.id );
            const item = await bucket.item( this[ ID ] );
            await item.content( this[ ITEMS ] );

        }

        static async load( group, seriesId ) {

            const bucket = await storage.bucket( group.id );
            const seriesItem = await bucket.item( seriesId );
            const items = await seriesItem.content();
            return items && new Series( group, seriesId, items );

        }

    }

    class Group {

        constructor( details ) {

            this[ ID ] = dateid();
            this[ DETAILS ] = clone( details ) || {};

        }

        get id() {

            return this[ ID ];

        }

        get( prop ) {

            return this[ DETAILS ][ prop ];

        }

        async save() {

            const bucket = await storage.bucket( this[ ID ] );
            const detailsItem = await bucket.item( "details" );
            await detailsItem.content( this[ DETAILS ] );

        }

        async delete() {

            const bucket = await storage.bucket( this[ ID ] );
            await bucket.delete();

        }

        async createSeries( seriesId ) {

            return new Series( this, seriesId );

        }

        async loadSeries( seriesId ) {

            return await Series.load( this, seriesId );

        }

        static async load( id ) {

            const bucket = await storage.bucket( id );
            const detailsItem = await bucket.item( "details" );
            const details = await detailsItem.content();
            return new Group( details );

        }

    }

    return {

        Group

    };

};
