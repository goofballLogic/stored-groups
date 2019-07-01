const dateid = require( "../dateid" );
const {

    discriminator,
    editValuesCommand,
    addToIndexCommand

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

async function addToIndex( path, node, schemaLoader, index, values, options ) {

    const { fetchSchemaFor } = schemaLoader;
    const schema = await fetchSchemaFor( values && values.template && values.template.values );
    return {

        [ discriminator ]: addToIndexCommand,
        schema,
        execute: async entry => {

            const nodeid = dateid();
            // add to the index
            const updatedIndex = await node.addToIndex( { [ nodeid ]: entry } );
            // new node
            const newNode = await updatedIndex[ nodeid ].go()
            await newNode.setValues( entry );

        }

    };

}

module.exports = {

    async index( path, node, schemaLoader, index, values, { template } ) {

        return [

            ( index && index.immutable ) || await addToIndex( path, node, schemaLoader, index, values, template )

        ].filter( x => x );

    },

    async values( path, node, schemaLoader, index, values, options ) {

        if ( !values ) return [];
        return [

            await editValues( path, node, schemaLoader, values )

        ];

    }

};
