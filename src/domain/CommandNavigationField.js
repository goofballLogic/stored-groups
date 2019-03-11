const asArray = require( "../asArray" );
const known = require( "./known.json" );
const NavigationField = require( "./NavigationField" );
const { commandFormsForSeriesValues } = require( "./commandForms" );

const { fieldTypes: knownFieldTypes } = known;

class CommandNavigationField extends NavigationField {

    constructor( options ) {

        super( options );

    }

    static buildForEditValues( { series, values } ) {

        const key = "edit-values";
        const fieldTypes = [ knownFieldTypes.nav.edit ];
        return CommandNavigationField.buildForValues( { key, values, fieldTypes, series, defaultLabel: "Edit" } );

    }

    static buildForAddCollectionMember( { series, values } ) {

        const key = "add-item";
        const fieldTypes = [ knownFieldTypes.nav.addCollectionMember ];
        return CommandNavigationField.buildForValues( { key, values, fieldTypes, series, defaultLabel: "New" } );

    }

    static buildForValues( { key, values, fieldTypes = [], series, defaultLabel } ) {

        if ( !values ) return undefined;

        const recordType = asArray( values[ "@type" ] );
        const knownRecordType = recordType.find( type => known.types[ type ] ) || {};
        const types = {

            navigation: knownRecordType.editNavFieldType || knownFieldTypes.hyperlink

        };
        const label = knownRecordType.editLabel || defaultLabel;
        const thumbnail = knownRecordType.editThumbnail || null;

        // when i call go on a command navigation field, I want the outcome to be a new form set containing a form capable of invoking the command
        const go = async () => await commandFormsForSeriesValues( series, values );

        return new CommandNavigationField( {

            discriminator: key,
            types,
            fieldTypes,
            go,
            label,
            thumbnail

        } );

    }
}

module.exports = CommandNavigationField;