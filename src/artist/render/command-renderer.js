const {

    discriminator,
    addToIndexCommand,
    editValuesCommand,
    sys

} = require( "../../domain/symbols" );
const {

    addToIndex,
    editValues

} = require( "../commands" );
const {

    nav

} = require( "../inputs" );

function renderIndexCommand( { path, view, command, document } ) {

    if ( !command ) return "";
    const actionableFormat = sys( view.values, "actionable" );
    const schema = command.schema;
    const execute = command.execute.bind( command );
    switch( command[ discriminator ] ) {

        case addToIndexCommand:
            return addToIndex( { execute, path, schema, document, actionableFormat } );

        default:
            return "";

    }

}

const asArray = maybeArray => Array.isArray( maybeArray ) ? maybeArray : maybeArray ? [ maybeArray ] : [];

function renderValuesCommand( { path, view, command, document } ) {

    if ( !command ) return "";
    const values = view.values || {};
    const actionableFormat = sys( values, "actionable" );
    const schema = command.schema;
    const execute = command.execute.bind( command );
    const types = asArray( values[ "@type" ] );
    switch( command[ discriminator ] ) {

        case editValuesCommand:
            return editValues( { execute, path, schema, document, actionableFormat, types, values } );

        default:
            console.warn( "Unknown", command[ discriminator ] );

    }

}

function renderCommands( commandsName, options ) {

    if ( commandsName !== "index" && commandsName !== "values" )
        throw new Error( `Out of range commandsName: ${commandsName}` );

    const commands = options.view.commands[ commandsName ];
    if ( !( commands && commands.length ) ) return "";

    const strategy = commandsName === "index" ? renderIndexCommand : renderValuesCommand;

    const rendered = commands.map( command => strategy( { ...options, command } ) ).filter( x => x ).join( "\n" );

    return rendered ? nav( rendered, `${commandsName}-commands` ) : "";

}

module.exports = {

    renderValuesCommands: options => renderCommands( "values", options ),
    renderIndexCommands: options => renderCommands( "index", options )

};
