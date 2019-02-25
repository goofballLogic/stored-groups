const { batchKeys } = require( "./vocab" );

module.exports = async ( series, command, { seriesId } ) => {

    const target = await series.loadSeries( seriesId );
    if ( !target ) return undefined;
    const values = command[ batchKeys.values ];
    if ( values ) target.set( values );
    await target.save();
    return target;

};
