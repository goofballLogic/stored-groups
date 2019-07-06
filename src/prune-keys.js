module.exports = function pruneKeys( obj, isPruned ) {

    if ( !( obj && typeof obj === "object" ) ) return obj;
    return Object.entries( obj )
        .filter( ( [ key ] ) => !isPruned( key ) )
        .reduce( ( pruned, [ key, value ] ) => ( {

            ...pruned,
            [ key ]: value

        } ), {} );

};
