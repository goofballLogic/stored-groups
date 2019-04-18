const discriminator = Symbol( "discriminator" );
module.exports = {

    discriminator,

    async initialize( { user, root } ) {

        console.log( user );
        const view = await buildView( [], root );
        console.log( view );

        const view2 = await view.index[ "1551529068666_e9rqswzil" ].go();
        console.log( view2 );

    }

};


async function buildView( path, node ) {

    const values = await node.values();
    const rawIndex = await node.index();
    const index = Object.entries(rawIndex).reduce( (prev, [key, value]) => ( {

        ...prev,
        [ [ ...path, key ].join( "__" ) ]: {
            ...value,
            [discriminator]: key,
            go: async function () {

                const newNode = await value.go();
                return buildView( [ ...path, key ], newNode );

            }

        }

    } ), {} );
    return { path, values, index };

}
