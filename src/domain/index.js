const known = require( "./known.json" );
const { fieldTypes: knownFieldTypes } = known;

class Field {

    constructor( { discriminator, label, types } ) {

        this.discriminator = discriminator;
        this.label = label;
        this.types = types;

    }

}

const goStrategyKey = Symbol( "go strategy" );

class NavigationField extends Field {

    constructor( options ) {

        super( options );
        this[ goStrategyKey ] = options.go;
        this.thumbnail = options.thumbnail

    }

    async go() {

        // when i call go on a navigation field, I want the outcome to be a new form set representing the new series
        const goStrategy = this[ goStrategyKey ];
        if ( !goStrategy ) return undefined;

        const newSeries = await goStrategy();
        return await formsForSeries( newSeries );

    }

}

function asArray( maybeArray ) {

    if ( Array.isArray( maybeArray ) ) return maybeArray;
    return maybeArray == null ? [] : [ maybeArray ];

}

function renderNavigationField( key, value, index ) {

    console.log( "Render a navigation field for", value );
    if ( !value ) return undefined;

    const types = asArray( value[ "@type" ] );
    const label = value.name || key;
    const thumbnail = value.thumbnail || null;
    const go = value.go ? ( () => value.go() ) : null;
    const discriminator = key;

    return new NavigationField( {

        discriminator,
        types,
        go,
        label,
        thumbnail

    } );

}

function renderField( key, value, values ) {

    console.log( "Render a field for", key, value, values );
    if ( !value ) return undefined;

    const recordType = asArray( values[ "@type" ] );
    const knownProp = known.props[ key ] || {};
    const types = {

        view: knownProp.view || knownProp.edit || knownFieldTypes.text,
        edit: knownProp.edit || knownFieldTypes.text

    };
    const label = knownProp.label || key;
    const discriminator = key;

    return new Field( {

        discriminator,
        types,
        label,
        recordType

    } );

}

class Form {

    constructor() {

        this.fields = new Set();

    }

}

async function formForIndex( index ) {

    const form = new Form();
    if ( index ) {

        const promisedFields = Object
            .entries( index )
            .map( ( [ key, value ] ) => renderNavigationField( key, value, index ) );
        const fields = await Promise.all( promisedFields );
        fields.filter( x => x ).forEach( field => form.fields.add( field ) );

    }
    return form;

}

async function formForValues( values ) {

    const form = new Form();
    if ( values ) {

        if ( values[ "@type" ] ) form.type( values[ "@type" ] );
        const promisedFields = Object
            .entries( values )
            .map( ( [ key, value ] ) => renderField( key, value, values ) );
        const fields = await Promise.all( promisedFields );
        fields.filter( x => x ).forEach( field => form.fields.add( field ) );

    }
    return form;

}

async function formsForSeries( series ) {

    const [ values, index ] = await Promise.all( [

        series.values(),
        series.index()

    ] );
    return Promise.all( [

        formForValues( values ),
        formForIndex( index )

    ] );

}

module.exports = {

    async initialize( { user, root } ) {

        const forms = await formsForSeries( root );
        forms.forEach( form => console.log( form ) );

        console.log( "Navigate using the first link in the second form (index)" );
        var indexForm = forms[ 1 ];
        var firstField = indexForm.fields.values().next().value;
        const newForms = await firstField.go();
        newForms.forEach( form => console.log( form.fields ) );

    }

}