const { systemPrefix } = require( "./symbols" );

module.exports = async function initializeFromTemplate( node, { template } ) {

    console.log( "Node", node );
    console.log( "Template", template );

    await node.setValues( {

        ...template.values,
        [ `${systemPrefix}metadata` ]: {

            version: template[ "@id" ] || "unknown",
            template

        }

    } );

};
