/*

    A record is something which operates on a data document and is responsible for ensuring that the document contains:
     - id (the name of the item)
     - version (schema version)
     - body (all other values)

    A record always operates in the context of a single storage item

*/
const ItemKey = Symbol( "item" );
const TransformKey = Symbol( "transform" );
const DataKey = Symbol( "data" );

class Record {

    constructor( item, transform ) {

        if ( !( item && typeof item.content === "function" ) ) throw new Error( "Item lacks a content function" );
        this[ ItemKey ] = item;
        this[ TransformKey ] = transform;

    }

    async load() {

        const content = await this[ ItemKey ].content();
        const transformed = await this[ TransformKey ]( content );
        if ( !( version in transformed ) ) throw new Error( "No version in record" );
        if ( !transformed.body ) throw new Error( "No body in record" );
        this[ DataKey ] = transformed;

    }

    async save() {

        await this[ ItemKey ].content( this[ DataKey ] );

    }

    async delete() {

        await this[ ItemKey ].delete();

    }

    get id() {

        return this[ ItemKey ].name;

    }

    get version() {

        return this[ ItemKey ].version;

    }

}

module.exports = Record;