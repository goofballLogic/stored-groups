const dateid = require( "../dateid" );
const { applyTemplate } = require( "./templates" );
const pick = require( "../pick" );
const asArray = require( "../asArray" );

const {

    discriminator,
    editValuesCommand,
    addToIndexCommand,
    sys,
    asSystem

} = require( "./symbols" );

const indexableProps = schema => ( schema && Array.isArray( schema.property ) )
    ? schema.property.filter( prop => prop.indexed ).map( prop => prop.path )
    : [];

async function editValues( path, node, schemaLoader, values ) {

    const { fetchSchemaFor } = schemaLoader;
    const schema = await fetchSchemaFor( values );
    if ( !schema ) return null;
    return {

        [ discriminator ]: editValuesCommand,
        schema,
        execute: async values => {

            // save values
            await node.setValues( values )

            // find index
            const parent = await node.parent();

            // update index
            const indexKey = path[ path.length - 1 ];
            const indexEntry = pick( values, indexableProps( schema ) );

            if ( Object.keys( indexEntry ).length )
                await parent.updateIndex( { [ indexKey] : indexEntry } );

        }

    };

}

async function addToIndex( path, node, schemaLoader, index, values, options ) {

    const { fetchSchemaFor } = schemaLoader;
    const template = sys( values, "template" );
    const schema = await fetchSchemaFor( template && template.values );
    if ( !schema ) return null;
    return {

        [ discriminator ]: addToIndexCommand,
        schema,
        execute: async newValues => {

            const nodeid = dateid();

            const indexEntry = pick( newValues, indexableProps( schema ) );

            // add entry to the index
            const updatedIndex = await node.addToIndex( { [ nodeid ]: indexEntry } );

            // get new node from the index
            const newNode = await updatedIndex[ nodeid ].go();

            const newValuesWithSchema = { ...newValues, [ asSystem( "schema" ) ]: schema };

            const template = sys( values, "template" );
            const newIndex = template && template.index;
            await applyTemplate( newNode, newIndex, newValuesWithSchema );

        }

    };

}

module.exports = {

    async index( path, node, schemaLoader, index, values, options ) {

        const { template } = options;
        const metadata = sys( index, "metadata" );
        const immutable = sys( metadata, "immutable" );
        return [

            !immutable && await addToIndex( path, node, schemaLoader, index, values, template )

        ].filter( x => x );

    },

    async values( path, node, schemaLoader, index, values, options ) {

        if ( !values ) return [];

        return [

            await editValues( path, node, schemaLoader, values )

        ].filter( x => x );

    }

};
