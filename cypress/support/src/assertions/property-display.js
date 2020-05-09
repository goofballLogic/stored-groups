export const simplePropertyValuesAreDisplayed = () => cy.contains(".property > a.object", "Current scoresheet");
export const listOfDataSetsIsDisplayed = (listName, expected) => {
    cy
        .contains(".property .label", "List")
        .parent()
        .contains(".property-value", listName)
        .parent()
        .parent()
        .contains(".property .label", "Items")
        .parent()
        .find(".property-value ul")
        .then(list => 
            expected && expected.hashes().forEach(item => 
                cy.get(list).contains("li .property a", item.name)                
            )
        );
};