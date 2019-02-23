const jsonld = require( "jsonld" );
const processCreate = require( "./processCreate" );
const processDelete = require( "./processDelete" );
const { context, commandTypes } = require( "./vocab" );

const allCommandTypes = Object.values( commandTypes );

function determineCommandType( command ) {

    if ( !command ) return undefined;
    const dataTypes = command[ "@type" ];
    if ( !dataTypes ) return undefined;
    return dataTypes.find( dt => allCommandTypes.includes( dt ) );

}

async function preprocess( commands ) {

    const expanded = await jsonld.expand( commands );
    return Promise.all( expanded.map( async command => ( {

        type: determineCommandType( command ),
        raw: ( await jsonld.compact( command, context ) )

    } ) ) );

}

function validate( queue ) {

    const untypedCommands = queue.filter( command => !command.type );
    if ( untypedCommands.length )
        throw new Error( `Untyped (or unrecognised) commands found: ${JSON.stringify( untypedCommands )}` );

}

module.exports = series => ( {

    async process( commands ) {

        const queue = await preprocess( commands );
        validate( queue );
        let working = undefined;
        for( const { type, raw } of queue ) {

            switch( type ) {

                case commandTypes.create:
                    working = await processCreate( series, raw );
                    break;

                case commandTypes.delete:
                    await processDelete( series, raw );
                    working = null;
                    break;

                default:
                    throw new Error( `Unhandled: ${type} command ${JSON.stringify( raw )}` );

            }

        }
        if ( working === null ) return null;
        return await working.export();

    }

} );
module.exports.commandTypes = commandTypes;
