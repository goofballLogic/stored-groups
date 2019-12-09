const artist = require( "../artist" );
const { values: valuesCommands, index: indexCommands } = require( "./commands" );
const { node: nodeNavigations, entry: entryNavigations } = require( "./navigations" );
const symbols = require( "./symbols" );
const {

    discriminator,
    sys,
    isSystem

} = symbols;
const { initializeFromTemplate, ensureVersionUpgrades } = require( "./templates" );
const pick = require( "../pick" );

module.exports = {

    symbols,
    async initialize( { user, root, schemaLoader, options } ) {

        const values = await root.values();
        const metadata = sys( values, "metadata" );
        if ( !( metadata && metadata.version ) ) {

            await initializeFromTemplate( root, options );

        }
        await ensureVersionUpgrades( root, options );
        const view = await buildView( [], root, root, schemaLoader, options );
        artist.initialize( { user, view, window: options.window } );

    }

};

const buildKey = bits => bits.join( "/" );

async function buildView( path, node, root, schemaLoader, options ) {

    const values = await node.values();
    const rawIndex = await node.index();

    const buildViewForPathAndNode =
        ( newPath, newNode ) => buildView( newPath, newNode, root, schemaLoader, options );

    const entryKey =
        key => buildKey( [ ...path, key ] );

    function entryValue( key, value ) {

        if ( typeof value !== "object" ) return undefined;
        if ( !value ) return undefined;
        const entryProps = Object.keys( value ).filter( x => x !== "go" );
        return {

            ...pick( value, entryProps ),
            [ discriminator ]: key,
            nav: entryNavigations( value, buildViewForPathAndNode )

        };

    }

    const index = rawIndex
        ? Object.entries( rawIndex )
            .filter( ( [ key ] ) => !isSystem( key ) )
            .reduce( (prev, [key, value]) => ( {

                ...prev,
                [ entryKey( key ) ]: entryValue( key, value )

            } ), {} )
        : null;

    const commands = {

        nav: await nodeNavigations( root, buildViewForPathAndNode ),
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
