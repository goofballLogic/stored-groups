const IntlMessageFormat = require( "intl-messageformat" ).default;

module.exports = {

    format( format , params ) {

        return format && new IntlMessageFormat( format ).format( params );

    }

}