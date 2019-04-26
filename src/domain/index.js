const artist = require( "../artist" );

const discriminator = Symbol( "discriminator" );
module.exports = {

    async initialize( { user, root } ) {

        const view = await buildView( [], root );
        artist.initialize( { user, view } );

    }

};


async function buildView( path, node ) {

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
                    return buildView( [ ...path, key ], newNode );

                }

            }

        } ), {} )
        : null;
    return { path, values, index };

}
