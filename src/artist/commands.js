const { format } = require( "./message-formatting" );
const { input, comment } = require( "./inputs" );
const asArray = require( "../asArray" );
const dateid = require( "../dateid" );
const { isSystem } = require( "../domain/symbols" );

function formSubmitCommandDetector( e ) {

    if ( e.target.name !== "command" ) return;
    const form = e.target.closest( "form" );
    if ( !form ) return;
    form.dataset.command = Array.from( e.target.classList )[ 0 ];
    form.dataset.command_cid = e.target.dataset.cid;

}

const saveHandlers = {};

function reifyIds( container ) {

    const inputs = container.querySelectorAll( "input,select,textarea" );
    const cid = dateid();
    for( const input of inputs ) {

        input.setAttribute( "name", input.getAttribute( "name" ).replace( /^_\//, `${cid}/` ) );

    }
    for( const ele of container.children ) {

        if ( "cid" in ele.dataset ) ele.dataset.cid = cid;

    }
    const buttons = container.querySelectorAll( "button" );
    for( const button of buttons ) {

        if ( "cid" in button.dataset ) button.dataset.cid = cid;

    }

}
async function formSubmitHandler( e ) {

    e.preventDefault();
    const form = e.target;
    if ( form ) {

        const document = form.ownerDocument;
        const { classList } = form;
        const command = form.dataset.command;
        form.dataset.command = null;
        const commandCid = form.dataset.command_cid;
        form.dataset.command_cid = null;
        switch( command ) {

            case "reveal":
                if ( !classList.contains( "populating" ) ) classList.add( "populating" );
                break;
            case "save":
                await saveHandlers[ form.dataset.cid ]( form );
                form.dispatchEvent( new CustomEvent( "artist-refresh", { bubbles: true } ) );
                break;
            case "new-item":
                const template = form.querySelector( "template.new-item" );
                if ( !template ) throw new Error( "No new item template" );
                const ele = document.importNode( template.content, true );
                reifyIds( ele );
                template.parentNode.insertBefore( ele, template );
                break;
            case "delete-new-item":
                Array.from( form.querySelectorAll( ".new-item" ) )
                    .filter( i => i.dataset.cid === commandCid )
                    .forEach( ele => ele.remove() );
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

function generateInputField( prop, maybeValues, fieldName ) {

    const opts = {

        name: encodeURI( fieldName || prop.path ),
        label: prop.name,
        readonly: prop.immutable,
        value: maybeValues && maybeValues[ prop.path ]

    };
    switch( prop.dataType ) {

        case "xsd:dateTimeStamp":
            return prop.immutable
                ? comment( "date time stamp will be calculated" )
                : input( { ...opts, inputType: "datetime-local" } )
        default:
            return input( { ...opts, inputType: "text" } );

    }

}

const nodeShapeProps = schema => ( schema && schema[ "@type" ] === "NodeShape" )
    ? asArray( schema.property )
    : defaultShape.property;

const generateDefaultSchemaFields = ( schema, maybeValues, generateAlias ) =>
    nodeShapeProps( schema )
        .filter( x => x )
        .map( prop =>
            `
                ${comment( JSON.stringify( prop ) )}
                ${generateInputField( prop, maybeValues, ( generateAlias && generateAlias( prop ) ) )}
            `
        ).join( "\n" );

const generateMemberSchemaFields = ( schema, maybeValues, index ) =>
    generateDefaultSchemaFields( schema, maybeValues, x => `${index}/${x.path}` );

const generateNewMemberFieldsForIdMap = ( schema, values ) => `

    <input name="@type" type="hidden" value="IdMap" />
    <template class="new-item">
        <div class="new-item" data-cid="">
            ${generateMemberSchemaFields( schema, null, "_" )}
            <button name="command" class="delete-new-item" data-cid="">Remove</button>
        </div>
    </template>
    <button name="command" class="new-item">New</button>

`;

const generateExistingMembersFieldsForIdMapMember = ( schema, key, value ) =>
    generateMemberSchemaFields( schema, value, key );

const generateExistingMembersFieldsForIdMap = ( schema, values ) =>
    Object.entries( values )
        .filter( ( [ key ] ) => key && !isSystem( key ) && !( key.startsWith( "@" ) ) )
        .reduce( ( acc, [ key, value ] ) => `${acc}${generateExistingMembersFieldsForIdMapMember( schema, key, value )}`, "" );

const generateFieldsForIdMap = ( schema, values ) =>
    generateNewMemberFieldsForIdMap( schema, values ) +
    generateExistingMembersFieldsForIdMap( schema, values );

function generateFieldsForSchemaAndTypes( { schema, types, values } ) {

    if ( types && types.includes( "IdMap" ) ) return generateFieldsForIdMap( schema, values );
    return generateDefaultSchemaFields( schema, values );

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

function generateValues( schemaProperties ) {

    return schemaProperties
        .filter( prop => prop.immutable )
        .reduce( ( obj, prop ) => ( {

            ...obj,
            [ prop.path ]: generateImmutableValue( prop )

        } ), {} );

}

function buildEntry( values, generatedValues, schemaProperties ) {

    return schemaProperties
        .reduce( ( obj, prop ) => ( {

            ...obj,
            [ prop.path ]: ( prop.immutable && ( prop.path in values ) )
                ? values[ prop.path ]
                : generatedValues[ prop.path ]

        } ), {} );

}

function buildSaveHandler( execute, schema, previousValues ) {

    return async function( form ) {

        const formData = new FormData( form );
        const schemaProperties = ( schema && schema.property ) || [];
        const generatedValues = generateValues( schemaProperties );
        const isIdMap = formData.get( "@type" ) === "IdMap";
        const initialData = isIdMap ? {} : buildEntry( previousValues, generatedValues, schemaProperties );
        const data = Array.from( formData )
            .filter( ( [ key ] ) => !key.startsWith( "@" ) )
            .reduce( ( obj, [ encodedKey, value ] ) => {

                const key = decodeURI( encodedKey );
                if ( isIdMap ) {

                    const [ id, path ] = key.split( "/" );
                    const previousIdValue = previousValues[ id ];
                    const idValue = obj[ id ] || buildEntry( previousIdValue, generatedValues, schemaProperties );
                    const schemaProp = schemaProperties.find( prop => prop.path === path );
                    if ( schemaProp && !schemaProp.immutable ) {

                        idValue[ path ] = value;
                        obj[ id ] = idValue;

                    }

                } else {

                    const schemaProp = schemaProperties.find( prop => prop.path === key );
                    if ( schemaProp && !schemaProp.immutable )
                        obj[ key ] = value;

                }
                return obj;

            }, initialData )

        return await execute( data );

    };

}

function addSaveHandler( { cid, document, execute, schema, values } ) {

    saveHandlers[ cid ] = buildSaveHandler( execute, schema, values );
    if ( document.body.dataset.formSubmitHandlerInstalled ) return;
    document.body.addEventListener( "click", formSubmitCommandDetector );
    document.body.addEventListener( "submit", formSubmitHandler );
    document.body.dataset.formSubmitHandlerInstalled = true;

}

function addToIndex( { execute, path, document, actionableFormat, schema } ) {

    const cid = `add-to-index_${path}`;
    addSaveHandler( { cid, document, execute, schema } );
    const variables = { count: 1 };
    const commandText = action => actionableFormat ? `${action} ${format( actionableFormat, variables )}` : action;
    return `
        <form class="add-to-index" data-cid="${cid}">

            ${generateDefaultSchemaFields( schema )}
            <button name="command" class="reveal">${commandText( "Add" )}</button>
            <button name="command" class="save">${commandText( "Save" )}</button>
            <button name="command" class="cancel">Cancel</button>

        </form>
    `;

}

function editValues( { execute, path, document, schema, types, actionableFormat, values } ) {

    const cid = `edit-values_${path}`;
    addSaveHandler( { cid, document, execute, schema, values } );
    const commandText = action => actionableFormat ? `${action} ${actionableFormat}` : action;
    return `
        <form class="edit-values" data-cid="${cid}">

            ${generateFieldsForSchemaAndTypes( { schema, types, values } )}
            <button name="command" class="reveal">${commandText( "Edit" )}</button>
            <button name="command" class="save">${commandText( "Save" )}</button>
            <button name="command" class="cancel">Cancel</button>

        </form>
    `;

}
module.exports = {

    addToIndex,
    editValues

};