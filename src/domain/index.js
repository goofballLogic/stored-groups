const artist = require( "../artist" );
const { values: valuesCommands, index: indexCommands } = require( "./commands" );
const symbols = require( "./symbols" );
const { discriminator } = symbols;
const initializeFromTemplate = require( "./templates" );

module.exports = {

    symbols,
    async initialize( { user, root, schemaLoader, options } ) {

        const values = await root.values();
        if ( !( values && values.metadata && values.metadata.version ) ) {

            await initializeFromTemplate( root, options );

        }
        const view = await buildView( [], root, root, schemaLoader, options );
        artist.initialize( { user, view, window: options.window } );

    }

};

const buildKey = bits => bits.join( "/" );

async function buildView( path, node, root, schemaLoader, options ) {

    const values = await node.values();
    const rawIndex = await node.index();

    function entryKey( key ) {

        return buildKey( [ ...path, key ] );

    }

    function entryValue( key, value ) {

        return {

            ...value,
            [discriminator]: key,
            go: async function () {

                const newNode = await value.go();
                return buildView( [ ...path, key ], newNode, root, schemaLoader, options );

            }

        };

    }

    const index = rawIndex
        ? Object.entries( rawIndex ).reduce( (prev, [key, value]) => ( {

            ...prev,
            [ entryKey( key ) ]: entryValue( key, value )

        } ), {} )
        : null;

    const commands = {

        nav: {

            go: async function( path ) {

                path = path ? Array.isArray( path ) ? path : [ path ] : [];
                let step = null;
                let node = root;
                const newPath = [];
                while( step = path.shift() ) {

                    const index = await node.index();
                    const indexStep = index[ step ];
                    if ( !indexStep ) return undefined;
                    node = await indexStep.go();
                    newPath.push( step );

                }
                return await buildView( newPath, node, root, schemaLoader, options );

            }

        },
        values: await valuesCommands( path, node, schemaLoader, rawIndex, values, options ),
        index: await indexCommands( path, node, schemaLoader, rawIndex, values, options )

    };

    return {

        path,
        values,
        index,
        commands

    };

}
