module.exports = async ( series, command ) => {

    const created = await series.createSeries( command.options );
    if ( command.props )
        created.set( command.props );
    await created.save();
    return created;

};
