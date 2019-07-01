const {

    format

} = require( "./message-formatting" );
const {

    input,
    comment

} = require( "./inputs" );

function formSubmitCommandDetector( e ) {

    if ( e.target.name !== "command" ) return;
    const form = e.target.closest( "form" );
    if ( !form ) return;
    form.dataset.command = Array.from( e.target.classList )[ 0 ];

}

const saveHandlers = {};

async function formSubmitHandler( e ) {

    e.preventDefault();
    const form = e.target;
    if ( form ) {


        const { classList } = form;
        const command = form.dataset.command;
        form.dataset.command = "";
        switch( command ) {

            case "reveal":
                if ( !classList.contains( "populating" ) ) classList.add( "populating" );
                break;
            case "save":
                await saveHandlers[ form.dataset.cid ]( form );
                form.dispatchEvent( new CustomEvent( "artist-refresh", { bubbles: true } ) );
                break;
            case "cancel":
                classList.remove( "populating" );
                form.reset();
                break;
            default:
                throw new Error( "Unrecognised command - " + command );

        }

    }

}

const defaultShape = {

    "@type": "NodeShape",
    "property": [ { "path": "name", "dataType": "xsd:string" } ]

};

function generateInputField( prop ) {

    const opts = { name: encodeURI( prop.path ), label: prop.name, readonly: prop.immutable };
    switch( prop.dataType ) {

        case "xsd:dateTimeStamp":
            return prop.immutable
                ? comment( "date time stamp will be calculated" )
                : input( { ...opts, inputType: "datetime-local" } )
        default:
            return input( { ...opts, inputType: "text" } );

    }

}

function generateIndexFields( schema ) {

    schema = ( schema && schema[ "@type" ] === "NodeShape" ) ? schema : defaultShape;
    return ( Array.isArray( schema.property ) ? schema.property : [].concat( schema.property ) )
        .map( prop => `
            ${comment( JSON.stringify( prop ) )}
            ${generateInputField( prop )}
        ` )
        .join( "\n" );

}

function generateImmutableValue( { dataType } ) {

    switch( dataType ) {

        case "xsd:dateTimeStamp":
            const dts = new Date().toISOString();
            return dts.substring( 0, 19 ) + dts.substr( -1, 1 );
        default:
            return undefined;

    }

}

function addToIndex( { execute, path, document, actionableFormat, schema } ) {

    const cid = `add-to-index_${path}`;
    saveHandlers[ cid ] = async function( form ) {

        const generatedValues = ( ( schema && schema.property ) || [] )
            .filter( prop => prop.immutable )
            .reduce( ( obj, prop ) => ( {

                ...obj,
                [ prop.path ]: generateImmutableValue( prop )

            } ), {} );

        const data = Array.from( new FormData( form ) )
            .reduce( ( obj, [ key, value ] ) => ( {

                ...obj,
                [ decodeURI( key ) ] : value

            } ), {} );

        return await execute( { ...data, ...generatedValues } );

    };

    if ( !document.body.dataset.formSubmitHandler ) {

        document.body.addEventListener( "click", formSubmitCommandDetector );
        document.body.addEventListener( "submit", formSubmitHandler );
        document.body.dataset.formSubmitHandler = true;

    }
    return `
        <form class="add-to-index" data-cid="${cid}">

            ${generateIndexFields( schema )}
            <button name="command" class="reveal">Add ${format( actionableFormat, { count: 1 } )}</button>
            <button name="command" class="save">Save</button>
            <button name="command" class="cancel">Cancel</button>

        </formt>
    `;

}

module.exports = {

    addToIndex

};