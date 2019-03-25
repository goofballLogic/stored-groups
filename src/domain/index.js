const formsForSeries = require( "./forms" );

const reverse = x => x.split( "" ).reverse().join( "" );

module.exports = {

    async initialize( { user, root } ) {

        const forms = await formsForSeries( root );
        console.log( "Forms for the root series", forms );
        //console.dir( forms, { depth: 5 } );

        console.log( "Navigate using the first link in the index form" );
        var indexForm = forms.find( form => form.type.includes( "domain_known_types_index-form" ) );
        var firstField = indexForm.fields.values().next().value;
        const seriesBForms = await firstField.go();

        console.log( "Forms for the series targetted by the first navigation field [series B]", seriesBForms );
        //console.dir( seriesBForms, { depth: 5 } );

        console.log( "Follow the edit-values command nav of the values-form for of series B" );
        const seriesBValuesForm = seriesBForms.find( x => x.type.includes( "domain_known_types_values-form" ) );
        const editNav = Array.from( seriesBValuesForm.fields ).find( x => x.type.includes( "domain_known_fieldTypes_navigation_edit" ) );
        const seriesBeditValuesForms = await editNav.go();

        console.log( "Forms for editing values of series B", seriesBeditValuesForms );
        //console.dir( seriesBeditValuesForms, { depth: 5 } );

        console.log( "Update name for the edit values command" );
        const editValuesCommandForm = seriesBeditValuesForms.find( x => x.type.includes( "domain_known_types_edit-values-command" ) );
        const nameField = Array.from( editValuesCommandForm.fields ).find( x => x.discriminator === "name" );
        await editValuesCommandForm.save( {

            [ nameField.discriminator ]: reverse( nameField.value )

        } );

        console.log( "Navigate using the members link of series B's index-form" );
        const seriesBindexForm = seriesBForms.find( x => x.type.includes( "domain_known_types_index-form" ) );
        const membersNav = Array.from( seriesBindexForm.fields ).find( x => x.discriminator === "members" );
        const membersForms = await membersNav.go();

        console.log( "Forms for members series" );
        console.log( membersForms );

        const membersValuesForm = membersForms.find( x => x.type.includes( "domain_known_types_values-form" ) );
        const navigateToAddItemToMembersLink = Array.from( membersValuesForm.fields ).find( x => x.discriminator === "add-item" );
        const addItemToMembersForms = await navigateToAddItemToMembersLink.go();

        console.log( "Forms for add item to members" );
        console.dir( addItemToMembersForms, { depth: 5 } );

        const addItemToMembersForm = addItemToMembersForms.find( x => x.type.includes( "domain_known_types_add-member-command" ) );
        const added = await addItemToMembersForm.save( {

            "familyName": "Gibson",
            "givenName": "Hawk",
            "jobTitle": "Chief Mouser",
            "created": new Date().toISOString()

        } );
console.log( added );

    }

}