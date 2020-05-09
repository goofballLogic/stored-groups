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
        .then(itemsPropertyValue =>
            expected && expected.hashes().forEach(item => {
                cy.get(itemsPropertyValue)
                    .contains(".property .label", "Name")
                    .parent()
                    .contains(".property-value", item.name)
            })
        );
};