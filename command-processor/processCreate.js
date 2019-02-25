const { batchKeys } = require( "./vocab" );

module.exports = async ( series, command ) => {

    const created = await series.createSeries( command.options );
    const props = command[ batchKeys.props ];
    if ( props ) created.set( props );
    await created.save();
    return created;

};
