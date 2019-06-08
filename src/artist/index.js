const { discriminator, editValuesCommand } = require( "../domain/symbols" );
const { JSDOM } = require( "jsdom" );

async function fetch( view, indexPredicate ) {

    if ( !( view && view.index ) ) return undefined;
    const item = Object.values( view.index ).find( indexPredicate );
    return ( item && item.go ) ? await item.go() : undefined;

}

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

    console.log( JSON.stringify( values, null, 3 ) );
    const items = Object.entries( values ).filter( ( [ key ] ) =>

        key && key[ 0 ] !== "@" && key !== "schema"

    ).map( ( [ key, value ] ) =>

        li( key, renderValues( value ) )

    );
    return ul( items )
    return "an id map";

}

function renderValuesByType( values ) {

    const types = values[ "@type" ];
    if( !Array.isArray( types ) ) return null;
    if( !types.length ) return null;
    if( types.includes( "IdMap" ) ) return renderIdMapValues( values );
    return null;

}

const renderValuesByDefault = values =>

    Object.entries( values ).reduce(

        ( prev, [ key, value ] ) => `${prev}${renderValue( key, value )}\n`,
        ""

    );

const renderValues = values => renderValuesByType( values ) || renderValuesByDefault( values );

const renderViewValues = parentView => ( parentView && parentView.values ) ? renderValues( parentView.values ) : "";

const renderIndex = parentView =>

    ( parentView && parentView.index )

        ? `<nav>
            ${Object.entries( parentView.index ).reduce( ( prev, [ path, view ] ) =>

                `${prev}
                <a href="#${path}" class="view">
                    ${

                        view.thumbnail ? `<img class="view-thumbnail" src="${view.thumbnail}" />` : ""

                    }<span class="name">${

                        view.name || view.path

                    }</span>
                </a>`,
                ""

            )}
        </nav>`
        : "";

function renderView( view, render ) {

    render(
        renderViewValues( view ) +
        renderIndex( view )
    );

}

module.exports = {

    async initialize( { user, view } ) {

        console.log( user );
        console.log( view );

        const dom = new JSDOM("<!DOCTYPE html><html><body><main></main></body></html>", { url: "http://dev.openteamspace.com/console" });
        const container = dom.window.document.querySelector( "main" );

        function render( html ) {

            container.innerHTML = html;
            console.log( container.outerHTML );
            container.querySelector( "a" ).click();

        }

        dom.window.addEventListener( "hashchange", async e => {

            const hashPath = dom.window.document.location.hash.substring( 1 );
            const viewPath = view.path.join( "_" );
            if ( hashPath === viewPath ) return;
            const targetNode = view.index && view.index[ hashPath ];
            if ( !( targetNode && targetNode.go ) ) {

                render( `<div class="not-found">${targetNode ? "Access denied" : "Not found"}</div>` );

            } else {

                view = await targetNode.go();
                renderView( view, render );

            }

        } );
        renderView( view, render );

        return;

        const teamZero = await fetch( view, x => x.name === "Team Zero" );

        console.log( "\n\nHere is Team Zero\n" );
        console.dir( teamZero, { depth: 6 } );

        const command = teamZero.commands.values.find(c => c[ discriminator ] === editValuesCommand );
        console.log( "\n\nHere is the command\n" );
        console.dir( command, { depth: 6 } );

        console.log( "\n\nBefore and after saving\n" );

        console.log( teamZero.values );
        const reversedName = teamZero.values.name.split( "" ).reverse().join( "" );
        await command.execute( { name: reversedName } );
        const teamZero2 = await fetch( view, x => x.name === "Team Zero" );
        console.log( teamZero2.values );
    }

};
