const fs = require( "fs" );
const team = JSON.parse( fs.readFileSync( require.resolve( "../../schema/team.jsonld" ) ).toString() );

module.exports = {

    async fetchSchemaFor( doc ) {

        if ( !( doc && doc[ "@schema" ] ) ) return undefined;
        const schemaUrl = doc[ "@schema" ];
        switch( schemaUrl ) {

            case "devots:team":
                return JSON.parse( JSON.stringify( team ) );

            default:
                throw new Error( `Unable to resolve schema ${schemaUrl}` );

        }

    }

}