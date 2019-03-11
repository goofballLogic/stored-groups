const Form = require( "./Form" );
const Field = require( "./Field" );
const known = require( "./known.json" );
const asArray = require( "../asArray" );

function guessDataType( value ) {

    if ( typeof value === "number" ) {

        if ( value.toString().length === 13 )
            return "xsd:datetime";
        return "xsd:float";

    }
    if ( typeof value === "string" ) return "xsd:string";
    if ( value === null ) return "xsd:string";
    return undefined;

}

function schemaPropertyFromValue( [ key, value ] ) {

    const propMetadata = known.props[ key ] || { label: key };
    return {

        "path": key,
        "dataType": guessDataType( value ),
        "name": propMetadata.label

    };

}

function schemaForValues( values ) {

    if ( values.schema && asArray( values.schema[ "@type" ] ).includes( "NodeShape" ) )
        return values.schema;

    return {

        "@type": [ "NodeShape" ],
        property: Object.entries( values ).map( schemaPropertyFromValue )

    };

}

function isCollection( values ) {

    return asArray( values[ "@type" ] ).includes( known.types.idMap );

}

function editFormForValues( series, values ) {

    if ( !values ) return undefined;
    if ( isCollection( values ) ) return null;

    const subType = known.types.editValuesCommand;
    const save = async entries => await series.setValues( entries );
    const form = Form.buildForCommand( { subType, save } );
    const { property } = schemaForValues( values );
    property.forEach( ( { path, dataType, name } ) => {

        const value = values[ path ];
        const types = [ dataType ];
        const key = path;
        const label = name;
        form.fields.add( Field.build( { key, value, values, types, label } ) );

    } );
    return form;

}

async function commandFormsForSeriesValues( series, values ) {

    return [

        editFormForValues( series, values )

    ];

}

module.exports = {

    commandFormsForSeriesValues

};