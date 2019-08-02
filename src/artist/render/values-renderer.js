const {

    format

} = require( "../message-formatting" );
const {

    comment,
    labelledDiv,
    section,
    labelledImg,
    ul,
    li

} = require( "../inputs" );
const {

    isSystem

} = require( "../../domain/symbols" );
const {

    renderIdMapValueCommands

} = require( "./command-renderer" );
function renderValue( key, value, params ) {

    switch( key ) {

        case "name":
            return labelledDiv( key, "Name", format( value, params ) );
        case "thumbnail":
            return labelledImg( key, "Thumbnail", value );
        case "created":
            return labelledDiv( key, "Created", new Date(value) );
        case "schema":
            return "";
        case "familyName":
            return labelledDiv( key, "Last name", value );
        case "givenName":
            return labelledDiv( key, "First name", value );
        case "jobTitle":
            return labelledDiv( key, "Job", value );
        default:
            if ( key[ 0 ] === "@" ) return "";
            return comment( `Unknown: ${key} ${JSON.stringify(value)}` );

    }

}

const isMeta = key => key && key.startsWith( "@" );

function renderIdMapValues( values, params ) {

    const items = Object.entries( values )
        .filter( ( [ key ] ) => key && !isMeta( key ) && !isSystem( key ) )
        .map( ( [ key, value ] ) =>

            li( key, renderValues( value, params ) )

        );
    return ( items && items.length ) ? ul( items ) : "";

}

function renderValuesByType( values, params ) {

    let types = values[ "@type" ];
    if ( !types ) return "";
    types = Array.isArray( types ) ? types : [ types ];
    if( !types.length ) return "";
    if( types.includes( "IdMap" ) ) return renderIdMapValues( values, params );
    return "";

}

const renderValuesByDefault = ( values, params ) =>
    Object.entries( values )
        .filter( ( [ key ] ) => !isSystem( key ) )
        .map( ( [ key, value ] ) => renderValue( key, value, params ) )
        .filter( x => x )
        .join( "\n" );

const renderValues = ( values, params ) =>
    renderValuesByType( values, params ) ||
    renderValuesByDefault( values, params );

function renderViewValues( { path, view, documents } ) {

    if ( !( view && view.values ) ) return "";
    const params = {

        indexCount: view.index ? Object.keys( view.index ).length : 0,
        commands: view.commands

    };
    const rendered = renderValues( view.values, params );
    return rendered && section( "values", "Values", rendered );

}

module.exports = {

    renderViewValues

};