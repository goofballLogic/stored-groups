const Form = require( "./Form" );
const Field = require( "./Field" );
const known = require( "./known.json" );
const asArray = require( "../asArray" );

class MissingSchemaError extends Error {

    constructor( message, data ) {

        super( `${message}: ${JSON.stringify( data, null, 3 )}` );
        this.data = data;

    }

}

// function guessDataType( value ) {

//     if ( typeof value === "number" ) {

//         if ( value.toString().length === 13 )
//             return "xsd:datetime";
//         return "xsd:float";

//     }
//     if ( typeof value === "string" ) return "xsd:string";
//     if ( value === null ) return "xsd:string";
//     return undefined;

// }

// function schemaPropertyFromValue( [ key, value ] ) {

//     const propMetadata = known.props[ key ] || { label: key };
//     return {

//         "path": key,
//         "dataType": guessDataType( value ),
//         "name": propMetadata.label

//     };

// }

// const mashHash =

//     objects => [ ...objects ].reverse().reduce( ( prev, next ) => ( { ...prev, ...next } ) );

// function schemaForMemberValues( values ) {


//     if ( values.schema && asArray( values.schema[ "@type" ] ).includes( "NodeShape" ) )
//         return values.schema;

//     const memberWithSchema = Object.values( values )
//         .filter( x => x && typeof x === "object" && "schema" in x )
//         .find( x => asArray( x.schema[ "@type" ] ).includes( "NodeShape" ) );
//     if ( memberWithSchema )
//         return memberWithSchema.schema;

//     return {

//         "@type": [ "NodeShape" ],
//         property: Object.entries( mashHash ).map( schemaPropertyFromValue )

//     };

// }

// function schemaForValues( values ) {

//     if ( values.schema && asArray( values.schema[ "@type" ] ).includes( "NodeShape" ) )
//         return values.schema;
//     throw new Error( )
//     // return {

//     //     "@type": [ "NodeShape" ],
//     //     property: Object.entries( values ).map( schemaPropertyFromValue )

//     // };

// }

function isCollection( values ) {

    return asArray( values[ "@type" ] ).includes( known.types.idMap );

}

// function schemaFormForValues( series, values, subType, property ) {

//     const save = async entries => await series.setValues( entries );
//     const form = Form.buildForCommand( { subType, save } );
//     property.forEach( ( { path, dataType, name } ) => {

//         const value = values[ path ];
//         const types = [ dataType ];
//         const key = path;
//         const label = name;
//         form.fields.add( Field.build( { key, value, values, types, label } ) );

//     } );
//     return form;

// }

function propertiesForValues( values ) {

    if ( values.schema && asArray( values.schema[ "@type" ] ).includes( "NodeShape" ) )
        return asArray( values.schema.property );
    throw new MissingSchemaError( "No schema (or not a NodeShape)", values );

};

function formForSubType( { series, values, subType } ) {

    const property = propertiesForValues( values );
    const save = async entries => await series.setValues( entries );
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