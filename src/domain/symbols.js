const systemPrefix = "http://openteamspace.com/vocab/";

module.exports = {

    discriminator: Symbol( "discriminator" ),
    editValuesCommand: Symbol( "edit-values-command" ),

    addToIndexCommand: Symbol( "add-to-index" ),

    sys( obj, prop ) { return obj && obj[ systemPrefix + prop ]; },
    asSystem( suffix ) { return systemPrefix + suffix; },
    isSystem( prop ) { return prop && prop.startsWith( systemPrefix ); }

};