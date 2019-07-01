const {

    discriminator,
    addToIndexCommand

} = require( "../domain/symbols" );
const {

    addToIndex

} = require( "./commands" );
const {

    maybeFormat

} = require( "./message-formatting" );
const {

    comment,
    nav,
    labelledDiv

} = require( "./inputs" );


function renderValue( key, value, params ) {

    switch( key ) {

        case "name":
            return labelledDiv( "value " + key, "Name", maybeFormat( value, params ) );
        case "schema":
            return "";
        default:
            if ( key[ 0 ] === "@" ) return "";
            return comment( `Unknown: ${key} ${JSON.stringify(value)}` );

    }

}

function renderIdMapValues( values, params ) {

    const items = Object.entries( values ).filter( ( [ key ] ) =>

        key && key[ 0 ] !== "@" && key !== "schema"

    ).map( ( [ key, value ] ) =>

        li( key, renderValues( value, params ) )

    );
    return ul( items );

}

function renderValuesByType( values, params ) {

    const types = values[ "@type" ];
    if( !( Array.isArray( types ) && types.length ) ) return null;
    if( types.includes( "IdMap" ) ) return renderIdMapValues( values, params );
    return null;

}

const renderValuesByDefault = ( values, params ) =>

    Object.entries( values ).reduce(

        ( prev, [ key, value ] ) => `${prev}${renderValue( key, value, params )}\n`,
        ""

    );

const renderValues = ( values, params ) =>
    renderValuesByType( values, params ) || renderValuesByDefault( values, params );

function renderViewValues( view ) {

    if ( !( view && view.values ) ) return "";
    const params = { indexCount: view.index ? Object.keys( view.index ).length : 0 };
    return labelledDiv( "values", "Values", renderValues( view.values, params ) );

}

const renderIndex = view =>

    ( view && view.index )

        ? nav(

            Object.entries( view.index ).reduce( ( prev, [ path, childView ] ) =>

                `${prev}
                <a href="#${path}" class="view">
                    ${

                        childView.thumbnail
                            ? `<img class="view-thumbnail" src="${childView.thumbnail}" />`
                            : div( "view-thumbnail-initial", ( childView.name || childView.path || "?" ).substr( 0, 1 ) )

                    }<span class="name">${

                        childView.name || childView.path

                    }</span>
                </a>`,
                ""

            )

        )
        : "";

function renderIndexCommand( { path, view, command, document } ) {

    if ( !command ) return "";
    const actionableFormat = view.values && view.values.actionable;
    const schema = command.schema;
    const execute = command.execute.bind( command );
    switch( command[ discriminator ] ) {

        case addToIndexCommand:
            return addToIndex( { execute, path, schema, document, actionableFormat } );

        default:
            return "";

    }

}

const renderIndexCommands = ( { path, view, document } ) => view.commands.index
    ? nav(
        view.commands.index
            .map( command => renderIndexCommand( { path, view, command, document } ) )
            .filter( x => x )
            .join( "\n" )
    )
    : "";

const renderMainNav = () => nav(`

    <a href="#" class="home"><span cass="name">Home</span></a>

`);

function renderView( { path, view, render, document } ) {

console.log( "Rendering", view );

    render( [

        renderMainNav(),
        renderIndex( view ),
        renderIndexCommands( { path, view, document } ),
        renderViewValues( view )

    ].join( "\n\n" ) );

}

function cleanFragment( window ) {

    if( window.document.location.href.endsWith( "#" ) ) {

        history.replaceState( null, document.title, window.location.pathname + window.location.search )

    }

}

module.exports = {

    async initialize( { user, view, window } ) {

        const document = window.document;
        const container = document.querySelector( "main" );
        const render = html => container.innerHTML = html;

        async function renderViewForPath( forceUpdate ) {

            const hashPath = document.location.hash.substring( 1 );
            cleanFragment( window );
            if ( !forceUpdate ) {

                const viewPath = view.path.join( "/" );
                if ( hashPath === viewPath ) return;

            }
            const path = hashPath.split( "/" );
            const targetView = await view.commands.nav.go( path );
            if ( !targetView ) {

                render( div( "not-found", "Not found" ) );

            } else {

                view = targetView;
                renderView( { path, view, render, document } );

            }

        }

        window.addEventListener( "hashchange", renderViewForPath );
        document.addEventListener( "artist-refresh", () => renderViewForPath( true ) );

        renderView( { path: view.path.join( "/" ), view, render, document } );
        renderViewForPath();

    }

};
