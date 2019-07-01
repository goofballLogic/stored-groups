const IntlMessageFormat = require( "intl-messageformat" ).default;

module.exports = {

    format( formattable , params ) {

        if ( !( formattable && formattable.format ) ) return formattable || "";
        return new IntlMessageFormat( formattable.format ).format( params );

    },

    maybeFormat( maybeFormattable, params ) {

        return ( maybeFormattable && maybeFormattable.format )
            ? format( maybeFormattable, params )
            : maybeFormattable;

    }

}