module.exports = function asArray( maybeArray ) {

    if ( Array.isArray( maybeArray ) ) return maybeArray;
    return maybeArray == null ? [] : [ maybeArray ];

}
