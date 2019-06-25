const div = ( key, label, value ) => `<div class="value ${key}"><span class="label">${label}</span><span class="value">${value}</span></div>`;
const ul = lis => `<ul>${lis.join( "\n" )}</ul>`;
const li = ( key, content ) => `<li id="${key}">${content}</li>`;
const comment = text => `<!-- ${text} -->`;

function renderValue( key, value ) {

    switch( key ) {

        case "name":
            return div( key, "Name", value );
        case "schema":
            return "";
        default:
            if ( key[ 0 ] === "@" ) return "";
            return comment( `Unknown: ${key} ${JSON.stringify(value)}` );

    }

}

function renderIdMapValues( values ) {

    const items = Object.entries( values ).filter( ( [ key ] ) =>

        key && key[ 0 ] !== "@" && key !== "schema"

    ).map( ( [ key, value ] ) =>

        li( key, renderValues( value ) )

    );
    return ul( items );

}

function renderValuesByType( values ) {

    const types = values[ "@type" ];
    if( !( Array.isArray( types ) && types.length ) ) return null;
    if( types.includes( "IdMap" ) ) return renderIdMapValues( values );
    return null;

}

const renderValuesByDefault = values =>

    Object.entries( values ).reduce(

        ( prev, [ key, value ] ) => `${prev}${renderValue( key, value )}\n`,
        ""

    );

const renderValues = values => renderValuesByType( values ) || renderValuesByDefault( values );

const renderViewValues = view => ( view && view.values ) ? renderValues( view.values ) : "";

const renderIndex = view =>

    ( view && view.index )

        ? `<nav>
            ${Object.entries( view.index ).reduce( ( prev, [ path, childView ] ) =>

                `${prev}
                <a href="#${path}" class="view">
                    ${

                        childView.thumbnail ? `<img class="view-thumbnail" src="${childView.thumbnail}" />` : ""

                    }<span class="name">${

                        childView.name || childView.path

                    }</span>
                </a>`,
                ""

            )}
        </nav>`
        : "";

function renderMainNav() {

    return `

        <nav class="main">
            <a href="#" class="home">
                <span cass="name">Home</span>
            </a>
        </nav>

    `;

}
function renderView( view, render ) {

console.log( "Rendering", view );

    render( [

        renderMainNav(),
        renderIndex( view ),
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

        const container = window.document.querySelector( "main" );
        const render = html => container.innerHTML = html;

        async function renderViewForPath() {

            const hashPath = window.document.location.hash.substring( 1 );
            cleanFragment( window );
            const viewPath = view.path.join( "/" );
            if ( hashPath === viewPath ) return;
            const path = hashPath.split( "/" );
            const targetView = await view.commands.nav.go( path );
            if ( !targetView ) {

                render( `<div class="not-found">Not found</div>` );

            } else {

                view = targetView;
                renderView( view, render );

            }

        }

        window.addEventListener( "hashchange", renderViewForPath );
        renderView( view, render );
        renderViewForPath();

    }

};
