const {

    renderIndexCommands,
    renderValuesCommands

} = require( "./render/command-renderer" );
const {

    renderViewValues

} = require( "./render/values-renderer" );
const {

    renderIndex

} = require( "./render/index-renderer" );
const {

    a,
    div,
    nav,
    span

} = require( "./inputs" );

function renderMainNav( path ) {

    const hrefUp = path && path.length && `#${path.slice( 0, -1 ).join(" / ")}`;
    return nav(

        a( "#", "home", span( "name", "Home" ) ) +
        hrefUp ? a( hrefUp, "up", span( "name", "Up" ) ) : ""

    );

}

function renderView( { path, view, render, document } ) {

    render( [

        renderMainNav( path ),
        renderViewValues( { path, view, document } ),
        renderValuesCommands( { path, view, document } ),
        renderIndex( view ),
        renderIndexCommands( { path, view, document } ),

    ].join( "\n\n" ) );

}

function cleanFragment( window ) {

    if( window.document.location.href.endsWith( "#" ) ) {

        history.replaceState( null, document.title, window.location.pathname + window.location.search )

    }

}

module.exports = {

    async initialize( { user, view, window } ) {

console.log(view);
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
            const path = hashPath.split( "/" ).filter( x => x );
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
