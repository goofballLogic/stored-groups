module.exports = x => new Promise( ( resolve, reject ) =>

    x( ( err, ...args ) =>

        err ? reject( err ) : resolve( ...args )

    )

);