module.exports = async function initializeFromTemplate( node, { template } ) {

    console.log( "Node", node );
    console.log( "Template", template );

    await node.setValues( {

        ...template.values,
        metadata: {

            version: template[ "@id" ] || "unknown",
            template

        }

    } );

};
