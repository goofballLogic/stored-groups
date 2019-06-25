const schemas = {

    "devots:team": require( "../../schema/team.jsonld" ),
    "devots:person": require( "../../schema/person.jsonld" )

};

module.exports = {

    fetchSchemaFor: function( values ) {

console.log( "Asked for schema", values.schema, schemas[ values.schema ] );
        if ( !values.schema ) return null;
        if ( values.schema in schemas ) return schemas[ values.schema ];
        throw new Error( `Unrecognised schema: ${values.schema}` );

    }

};
