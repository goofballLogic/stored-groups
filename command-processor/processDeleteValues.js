const { batchKeys } = require( "./vocab" );

module.exports = async ( series, command, { seriesId } ) => {

    const target = await series.loadSeries( seriesId );
    if ( !target ) return undefined;
    const { keys } = command;
console.log( keys );
console.log( target );
    if ( keys ) keys.forEach( key => target.remove( key ) );
    await target.save();
    return target;

};
