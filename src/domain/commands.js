const {

    discriminator,
    editValuesCommand,
    schema: schemaSymbol

} = require( "./symbols" );

async function editValues( path, node, schemaLoader, values ) {

    const { fetchSchemaFor } = schemaLoader;
    const schema = await fetchSchemaFor( values );
    return {

        [ discriminator ]: editValuesCommand,
        [ schemaSymbol ]: schema

    };

}

module.exports = {

    async values( path, node, schemaLoader, values ) {

        if ( !values ) return [];
        return [ await editValues( path, node, schemaLoader, values ) ];

    }

};
