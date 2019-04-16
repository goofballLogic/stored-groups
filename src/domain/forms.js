const Form = require( "./Form" );
const Field = require( "./Field" );
const NavigationField = require( "./NavigationField" );
const CommandNavigationField = require( "./CommandNavigationField" );
const asArray = require( "../asArray" );
const known = require( "./known.json" );

function formForIndex( { index } ) {

    const form = Form.buildForIndex();
    if ( index ) {

        const fields = Object
            .entries( index )
            .map( ( [ key, value ] ) => NavigationField.build( { key, value, index, formsForSeries } ) )
            .filter( x => x );

        fields.forEach( field => form.fields.add( field ) );

    }
    return form;

}

function isBlackListed( [ key ] ) {

    if ( key === "schema" ) return true;
    if ( key === "@type" ) return true;

}

function formForValues( { series, values } ) {

    const subType = asArray( values ? values[ "@type" ] : null );
    const form = Form.buildForValues( { subType } );
    if ( values ) {

        const navigableMembers = Object.entries( values ).filter( x => !isBlackListed( x ) )
        if ( subType.includes( known.types.idMap ) ) {

            const fields = navigableMembers.map( ( [ key, value ] ) =>

                NavigationField.buildForIdMapValue( key, value )

            );
            fields.filter( x => x ).forEach( field => form.fields.add( field ) );

            const addMemberField = CommandNavigationField.buildForAddCollectionMember( { series, values } );
            if ( addMemberField ) form.fields.add( addMemberField );

        } else {

            const fields = navigableMembers.map( ( [ key, value ] ) =>

                Field.build( { key, value, values } )

            );
            fields.filter( x => x ).forEach( field => form.fields.add( field ) );

            const editValuesField = CommandNavigationField.buildForEditValues( { series, values } );
            if ( editValuesField ) form.fields.add( editValuesField );

        }

    }
    return form;

}

/*

    returns forms which are useful for interacting with this series
        - for the series' values: a form which displays the values e.g.
            - for static values: an edit form
            - for an idMap:
                - a list of value objects (each with a link to edit or delete forms)
                - add item link
        - for the series' index: a form which displays links to linked series

*/
async function formsForSeries( series ) {

    const [ values, index ] = await Promise.all( [

        series.values(),
        series.index()

    ] );
    return await Promise.all( [

        formForValues( { series, values } ),
        formForIndex( { series, index } )

    ] );

}

module.exports = formsForSeries;
