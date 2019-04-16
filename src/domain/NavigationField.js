const asArray = require( "../asArray" );
const known = require( "./known.json" );
const Field = require( "./Field" );

const { fieldTypes: knownFieldTypes } = known;

const goKey = Symbol( "go" );
class NavigationField extends Field {

    constructor( options ) {

        super( options );
        const { go, thumbnail } = options;
        if ( go ) this[ goKey ] = go;
        if ( thumbnail ) this.thumbnail = thumbnail;

    }

    async go() {

        const go = this[ goKey ];
console.log( go.toString() );
        if ( !go ) return undefined;
        return await go();

    }

    static buildForIdMapValue( { key, value } ) {

        if ( key === "@type" ) return null;
        const fieldTypes = [ knownFieldTypes.nav.collectionMember ];
        return NavigationField.build( { key, value, fieldTypes } );

    }

    static build( { key, value, formsForSeries, fieldTypes } ) {

        if ( !value ) return undefined;

        const recordType = asArray( value[ "@type" ] );
        const knownRecordType = recordType.find( type => known.types[ type ] ) || {};
        const types = {

            navigation: knownRecordType.navigation || knownFieldTypes.hyperlink

        };
        const label = value.name || key;
        const thumbnail = value.thumbnail || null;
        fieldTypes = fieldTypes || [ knownFieldTypes.nav.series ];

        // when i call go on a navigation field, I want the outcome to be a new form set representing the new series
        const go = !value.go ? null : ( async () => {

            const newSeries = await value.go();
            return await formsForSeries( newSeries );

        } );

        return new NavigationField( {

            discriminator: key,
            types,
            fieldTypes,
            go,
            label,
            thumbnail

        } );

    }
}

module.exports = NavigationField;