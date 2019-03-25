const Form = require( "./Form" );
const Field = require( "./Field" );
const known = require( "./known.json" );
const asArray = require( "../asArray" );
const dateid = require( "../dateid" );

class MissingSchemaError extends Error {

    constructor( message, data ) {

        super( `${message}: ${JSON.stringify( data, null, 3 )}` );
        this.data = data;

    }

}

function isCollection( values ) {

    return asArray( values[ "@type" ] ).includes( known.types.idMap );

}

function propertiesForValues( values ) {

    if ( values.schema && asArray( values.schema[ "@type" ] ).includes( "NodeShape" ) )
        return asArray( values.schema.property );
    throw new MissingSchemaError( "No schema (or not a NodeShape)", values );

};

function saveForSubType( series, subType ) {

    switch( subType ) {

        case known.types.editValuesCommand:
            return async entries => await series.setValues( entries );

        case known.types.addMemberCommand:
            return async entries => await series.setValues( {

                [ dateid() ]: entries

            } );

        default:
            throw new Error( `Unrecognised command type: ${subType}` );

    }

}
function formForSubType( { series, values, subType } ) {

    const property = propertiesForValues( values );
    const save = saveForSubType( series, subType );
    const form = Form.buildForCommand( { subType, save } );
    property.forEach( ( { path, dataType, name } ) => {

        const value = values[ path ];
        const types = [ dataType ];
        const key = path;
        const label = name;
        const field = Field.build( { key, value, values, types, label } );
        form.fields.add( field );

    } );
    return form;

}

function addMemberFormForValues( series, values ) {

    if ( !values ) return undefined;
    if ( !isCollection( values ) ) return null;
    const subType = known.types.addMemberCommand;
    return formForSubType( { series, values, subType })

}

function editFormForValues( series, values ) {

    if ( !values ) return undefined;
    if ( isCollection( values ) ) return null;
    const subType = known.types.editValuesCommand;
    return formForSubType( { series, values, subType } );

}

async function commandFormsForSeriesValues( series, values ) {

    return [

        editFormForValues( series, values ),
        addMemberFormForValues( series, values )

    ].filter( x => x );

}

module.exports = {

    commandFormsForSeriesValues

};