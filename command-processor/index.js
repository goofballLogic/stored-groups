const jsonld = require( "jsonld" );
const processCreate = require( "./processCreate" );
const processDelete = require( "./processDelete" );
const processSetValues = require( "./processSetValues" );
const processDeleteValues = require( "./processDeleteValues" );
const { context, commandTypes, batchKeys, props } = require( "./vocab" );

const allCommandTypes = Object.values( commandTypes );

function determineCommandType( command ) {

    if ( !command ) return undefined;
    const dataTypes = command[ "@type" ];
    if ( !dataTypes ) return undefined;
    return dataTypes.find( dt => allCommandTypes.includes( dt ) );

}

function extractSeriesId( series ) {

    if ( !series ) return null;
    let seriesId = series[ "@id" ];
    const base = series[ batchKeys.base ] && series[ batchKeys.base ][ 0 ] && series[ batchKeys.base ][ 0 ][ "@value" ];
    if ( base && seriesId.startsWith( base ) ) seriesId = seriesId.substring( base.length );
    return seriesId;

}

async function preprocess( batch ) {

    const expanded = await jsonld.expand( batch );
    if ( expanded.length !== 1 ) throw new Error( `Expected to find exactly one batch, but found ${expanded.length}` );
    const [ expandedBatch ] = expanded;
    const series = expandedBatch[ batchKeys.series ];
    if ( series && series.length > 1 ) throw new Error( `More than one series specified: ${JSON.stringify( series )}` );
    const seriesId = series && series.length > 0 && extractSeriesId( series[ 0 ] );
    const commands = expandedBatch[ batchKeys.commands ];
    return {

        seriesId,
        commands: await Promise.all( commands.map( async command => ( {

            type: determineCommandType( command ),
            raw: ( await jsonld.compact( command, context ) )

        } ) ) )

    };

}

function validate( queue ) {

    if ( !queue.seriesId && queue.commands.some( command => command[ "@type" ] !== commandTypes.created ) )
        throw new Error( "Commands other than Create require a series to be specified" );
    const untypedCommands = queue.commands.filter( command => !command.type );
    if ( untypedCommands.length )
        throw new Error( `Untyped (or unrecognised) commands found: ${JSON.stringify( untypedCommands )}` );

}

async function process( series, batch ) {

    const queue = await preprocess( batch );
    validate( queue );
    let working = undefined;
    const { seriesId, commands } = queue;
    const options = { seriesId };
    for( const { type, raw } of commands ) {

        switch( type ) {

            case commandTypes.create:
                working = await processCreate( series, raw, options );
                break;

            case commandTypes.delete:
                await processDelete( series, raw, options );
                working = null;
                break;

            case commandTypes.setValues:
                working = await processSetValues( series, raw, options );
                break;

            case commandTypes.deleteValues:
                working = await processDeleteValues( series, raw, options );
                break;

            default:
                throw new Error( `Unhandled: ${type} command ${JSON.stringify( raw )}` );

        }

    }
    if ( working === null ) return null;
    return await working.export();

}

module.exports = series => ( { process: process.bind( this, series ) } );
module.exports.commandTypes = commandTypes;
module.exports.batchKeys = batchKeys;
module.exports.props = props;
