const { batchKeys } = require( "./vocab" );

module.exports = async ( series, command, { seriesId } ) => {

    const target = await series.loadSeries( seriesId );
    if ( !target ) return undefined;
    const items = command[ batchKeys.items ];
    if ( items ) {

        if ( Array.isArray( items ) )
            items.forEach( item => target.data( item ) );
        else
            target.data( items );
        await target.save();

    }
    return target;

};
