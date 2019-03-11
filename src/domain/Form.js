const asArray = require( "../asArray" );
const known = require( "./known.json" );
const clone = require( "../clone" );

const saveKey = Symbol( "save" );
const typeKey = Symbol( "type" );
class Form {

    constructor( options ) {

        const { types, save } = options;
        this[ typeKey ] = clone( asArray( types ) );
        this[ saveKey ] = save;
        this.fields = new Set();

    }

    async save( formValues ) {

        const command = this[ saveKey ];
        if ( !command ) throw new Error( "No save command" );
        const valueHash = Array.from( this.fields ).reduce(

            ( index, field ) => ( { ...index, [ field.discriminator ]: field.value } ),
            {}

        );
        Object.entries( formValues ).forEach( ( [ key, value ] ) => {

            valueHash[ key ] = formValues[ key ];

        } );
        const updated = await command( valueHash );
        return updated;

    }

    get type() {

        return clone( this[ typeKey ] );

    }

    static buildForValues( options ) {

        const { subType } = options || {};
        let types = [ known.types.valuesForm ];
        if ( subType ) types = types.concat( subType );
        return new Form( { types } );

    }

    static buildForIndex( options ) {

        const { subType } = options || {};
        let types = [ known.types.indexForm ];
        if ( subType ) types = types.concat( subType );
        return new Form( { types } );

    }

    static buildForCommand( options ) {

        const { subType, save } = options || {};
        let types = [ known.types.commandForm ];
        if ( subType ) types = types.concat( subType );
        return new Form( { types, save } );

    }

}

module.exports = Form;