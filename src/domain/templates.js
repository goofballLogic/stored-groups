const {

    sys,
    isSystem,
    asSystem

} = require( "./symbols" );
const pruneKeys = require( "../prune-keys" );

async function applyTemplate( node, indexTemplate, values ) {

    // set values for new node
    if ( values )
        await node.setValues( values );

    // index ?
    if ( !indexTemplate ) return;

    // new index from template except for nested system properties
    const indexEntries = Object.entries( indexTemplate ).reduce( ( obj, [ key, value ] ) => ( {

        ...obj,
        [ key ]: isSystem( key ) ? value : pruneKeys( value, x => isSystem( x ) )

    } ), {} );

    // create the index
    const index = await node.addToIndex( indexEntries );

    // find any index entries which contain a nested template
    const nestedTemplates = Object.entries( indexTemplate )
        .filter( ( [ , value ] ) => !!sys( value, "nested-template" ) )
        .map( ( [ key, value ] ) => [ key, sys( value, "nested-template" ) ] );

    // apply the nested templates
    await Promise.all( nestedTemplates.map( async ( [ prop, nestedTemplate ] ) => {

        // fetch the nested node
        const nestedNode = await index[ prop ].go();
        // apply the template
        await applyTemplate( nestedNode, nestedTemplate.index, nestedTemplate.values );

    } ) );

}

async function initializeFromTemplate( node, { template } ) {

    template = template || {};
    await node.setValues( {

        ...template.values,
        [ asSystem( "metadata" ) ]: {

            version: template[ "@id" ] || "unknown",
            template

        }

    } );

}

module.exports = {

    initializeFromTemplate,
    applyTemplate

};
