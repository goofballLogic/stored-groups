const artist = require( "../artist" );
const { values: valuesCommands } = require( "./commands" );
const symbols = require( "./symbols" );
const { discriminator } = symbols;

module.exports = {

    symbols,
    async initialize( { user, root, schemaLoader } ) {

        const view = await buildView( [], root, schemaLoader );
        artist.initialize( { user, view } );

    }

};

async function buildView( path, node, schemaLoader ) {

    const values = await node.values();
    const rawIndex = await node.index();
    const index = rawIndex
        ? Object.entries( rawIndex ).reduce( (prev, [key, value]) => ( {

            ...prev,
            [ [ ...path, key ].join( "__" ) ]: {

                ...value,
                [discriminator]: key,
                go: async function () {

                    const newNode = await value.go();
                    return buildView( [ ...path, key ], newNode, schemaLoader );

                }

            }

        } ), {} )
        : null;
    const commands = {

        values: await valuesCommands( path, node, schemaLoader, values )

    }
    return { path, values, index, commands };

}
