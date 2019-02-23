module.exports = async ( series, command ) => {

    if ( !command.series ) throw new Error( `Missing series property: ${JSON.stringify( command )}` );
    let { "@id": id, base } = command.series;
    if ( base && id.startsWith( base ) ) id = id.substring( base.length );
    await series.deleteSeries( id );

};
