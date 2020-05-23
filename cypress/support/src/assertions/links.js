export const selfLinkIsDisplayed = name => cy.contains("a", name);

export const simplePropertyValuesAreDisplayed = () =>
    cy
        .contains(".property .label", "Name")
        .parent()
        .contains(".property-value", "The Eggheads");

export const linksToObjectsAreRendered = table =>
    table.hashes().forEach(expected =>
        cy.contains(".property > a.object", expected.name)
    );

export const linksToCollectionsAreRendered = table =>
    table.hashes().forEach(expected =>
        cy.contains(".property > a.object", expected.name)
    );