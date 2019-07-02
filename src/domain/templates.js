const { asSystem } = require( "./symbols" );

module.exports = async function initializeFromTemplate( node, { template } ) {

    console.log( "Node", node );
    console.log( "Template", template );

    template = template || {};
    await node.setValues( {

        ...template.values,
        [ asSystem( "metadata" ) ]: {

            version: template[ "@id" ] || "unknown",
            template

        }

    } );

};
