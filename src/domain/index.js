const formsForSeries = require( "./forms" );
const reverse = x => x.split( "" ).reverse().join( "" );

const indexFormType = "domain_known_types_index-form";
const valuesFormType = "domain_known_types_values-form";
const editValueCommandType = "domain_known_types_edit-values-command";
const editNavigationFieldType = "domain_known_fieldTypes_navigation_edit";
const addMemberCommandType = "domain_known_types_add-member-command";

module.exports = {

    async initialize( { user, root } ) {

        const forms = await formsForSeries( root );

        console.log( "Navigate to the first team, using the first link in the index form" );
        var listOfTeams = forms.find( form => form.type.includes( indexFormType ) );
        var linkToFirstTeam = listOfTeams.fields.values().next().value;
        const teamForms = await linkToFirstTeam.go();

        console.log( "Follow the edit-values command nav of the values-form for the team series" );
        const teamValuesForm = teamForms.find( x => x.type.includes( valuesFormType ) );
        const linkToEditTeamValues = Array.from( teamValuesForm.fields ).find( x => x.type.includes( editNavigationFieldType ) );
        const teamValuesEditForms = await linkToEditTeamValues.go();

        console.log( "Update the team name using its edit values command form" );
        const editValuesCommandForm = teamValuesEditForms.find( x => x.type.includes( editValueCommandType ) );
        const nameField = Array.from( editValuesCommandForm.fields ).find( x => x.discriminator === "name" );
        await editValuesCommandForm.save( {

            [ nameField.discriminator ]: reverse( nameField.value )

        } );

        console.log( "Follow the members link from the team series' index-form" );
        const teamSeriesIndexForm = teamForms.find( x => x.type.includes( indexFormType ) );
        const membersNav = Array.from( teamSeriesIndexForm.fields ).find( x => x.discriminator === "members" );
        const membersForms = await membersNav.go();

        console.log( "Add new member" );
        const membersValuesForm = membersForms.find( x => x.type.includes( valuesFormType ) );
        const navigateToTheAddItemFormsForMembers = Array.from( membersValuesForm.fields ).find( x => x.discriminator === "add-item" );
        const addItemToMembersForms = await navigateToTheAddItemFormsForMembers.go();
        const addItemToMembersForm = addItemToMembersForms.find( x => x.type.includes( addMemberCommandType ) );
        const addedMemberId = await addItemToMembersForm.save( {

            "familyName": "Gibson",
            "givenName": "Hawk",
            "jobTitle": "Chief Mouser",
            "created": new Date().toISOString()

        } );
        console.log( "Added member id", addedMemberId );

        console.log( "Find added member's forms" );
        const membersFormsAfterAddingNewMember = await membersNav.go();
console.dir( membersFormsAfterAddingNewMember, { depth: 5 } );
        const membersValuesFormAfterAdd = membersFormsAfterAddingNewMember.find( x => x.type.includes( valuesFormType ) );

        const navigateToAddedMemberLink = Array.from( membersValuesFormAfterAdd.fields ).find( x => x.discriminator === addedMemberId );

        const addedMemberForms = await navigateToAddedMemberLink.go();

console.log( "Forms for added member" );
console.dir( addedMemberForms, { depth: 5 } );

    }

}