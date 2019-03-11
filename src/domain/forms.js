const Form = require( "./Form" );
const Field = require( "./Field" );
const NavigationField = require( "./NavigationField" );
const CommandNavigationField = require( "./CommandNavigationField" );
const asArray = require( "../asArray" );
const known = require( "./known.json" );

async function formForIndex( { index } ) {

    const form = Form.buildForIndex();
    if ( index ) {

        const promisedFields = Object
            .entries( index )
            .map( ( [ key, value ] ) => NavigationField.build( { key, value, index, formsForSeries } ) );
        const fields = await Promise.all( promisedFields );
        fields.filter( x => x ).forEach( field => form.fields.add( field ) );

    }
    return form;

}

async function formForValues( { series, values } ) {


    const subType = asArray( values ? values[ "@type" ] : null );
    const form = Form.buildForValues( { subType } );
    if ( values ) {

        if ( subType.includes( known.types.idMap ) ) {

            const promisedFields = Object
                .entries( values )
                .map( ( [ key, value ] ) => NavigationField.buildForCollectionMember( { key, value, formsForSeries } ) );
            const fields = await Promise.all( promisedFields );
            fields.filter( x => x ).forEach( field => form.fields.add( field ) );

            const addMemberField = CommandNavigationField.buildForAddCollectionMember( { series, values } );
            if ( addMemberField ) form.fields.add( addMemberField );

        } else {

            const promisedFields = Object
                .entries( values )
                .map( ( [ key, value ] ) => Field.build( { key, value, values } ) );
            const fields = await Promise.all( promisedFields );
            fields.filter( x => x ).forEach( field => form.fields.add( field ) );

            const editValuesField = CommandNavigationField.buildForEditValues( { series, values } );
            if ( editValuesField ) form.fields.add( editValuesField );

        }

    }
    return form;

}

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
