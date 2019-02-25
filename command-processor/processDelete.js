module.exports = async ( series, _, { seriesId } ) => {

    await series.deleteSeries( seriesId );

};
