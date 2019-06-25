const {

    discriminator,
    editValuesCommand

} = require( "./symbols" );

async function editValues( _, node, schemaLoader, values ) {

    const { fetchSchemaFor } = schemaLoader;
    const schema = await fetchSchemaFor( values );
    return {

        [ discriminator ]: editValuesCommand,
        schema,
        execute: async values => await node.setValues( values )

    };

}

module.exports = {

    async values( path, node, schemaLoader, values ) {

        if ( !values ) return [];
        return [ await editValues( path, node, schemaLoader, values ) ];

    }

};
