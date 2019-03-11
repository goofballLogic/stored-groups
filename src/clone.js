module.exports = function( x ) {

    return x ? JSON.parse( JSON.stringify( x ) ) : x;

}