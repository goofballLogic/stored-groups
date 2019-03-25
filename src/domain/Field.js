const clone = require( "../clone" );
const asArray = require( "../asArray" );
const known = require( "./known.json" );

const { fieldTypes: knownFieldTypes } = known;

const valueKey = Symbol( "value" );
const originalValueKey = Symbol( "originalValue" );
const typeKey = Symbol( "type" );
class Field {

    constructor( { discriminator, label, types, fieldTypes = [], value } ) {

        this.discriminator = discriminator;
        if ( label ) this.label = label;
        if ( types ) this.types = types;
        this[ typeKey ] = fieldTypes;
        this[ valueKey ] = value;
        this[ originalValueKey ] = value;

    }

    get originalValue() {

        return clone( this[ originalValueKey ] );

    }

    get value() {

        return clone( this[ valueKey ] );

    }

    get type() {

        return clone( asArray( this[ typeKey ] ) );

    }

    static build( { key, value, values, types, label } ) {

        const fieldTypes = asArray( values[ "@type" ] );
        const knownProp = known.props[ key ] || {};
        types = types || {

            view: knownProp.viewFieldType || knownProp.editFieldType || knownFieldTypes.string,
            edit: knownProp.editFieldType || knownFieldTypes.string

        };
        label = label || knownProp.label || key;
        if ( typeof value === "undefined" ) value = null;
        return new Field( {

            discriminator: key,
            types,
            label,
            fieldTypes,
            value

        } );

    }

}

module.exports = Field;