const dateid = require( "../dateid" );
const {

    discriminator,
    editValuesCommand,
    addToIndexCommand,
    systemPrefix

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
    const schema = await fetchSchemaFor( values && ( values[ `${systemPrefix}template` ] || {} ).values );
    return {

        [ discriminator ]: addToIndexCommand,
        schema,
        execute: async entry => {

            const nodeid = dateid();

            const indexableProps = ( schema && Array.isArray( schema.property ) )
                ? schema.property.filter( prop => prop.indexed ).map( prop => prop.path )
                : [];
            if ( !indexableProps.length ) indexableProps.push( "name" );

            const indexedEntry = indexableProps.reduce( ( x, path ) => ( { ...x, [ path ]: entry[ path ] } ), {} );

            // add to the index
            const updatedIndex = await node.addToIndex( { [ nodeid ]: indexedEntry } );

            // get new node
            const newNode = await updatedIndex[ nodeid ].go();

            // set values
            await newNode.setValues( entry );

            // set index
            const newIndex = values[ `${systemPrefix}template` ] && values[ `${systemPrefix}template` ].index;
            if ( newIndex ) await newNode.addToIndex( newIndex );

        }

    };

}

module.exports = {

    async index( path, node, schemaLoader, index, values, options ) {

        const { template } = options;
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
