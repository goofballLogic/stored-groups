export const selfLinkIsDisplayed = name => cy.contains("a", name);

export const simplePropertyValuesAreDisplayed = () => cy
    .contains(".property .label", "Name")
    .parent()
    .contains(".property-value", "The Eggheads");

export const linksToObjectsAreRendered = () => cy
    .contains(".property > a.object", "Current scoresheet");

export const linksToCollectionsAreRendered = () => {
    
    cy.contains(".property > a.object", "Team members");
    cy.contains(".property > a.object", "Scoresheets");
    cy.contains(".property > a.object", "Scores");
    cy.contains(".property > a.object", "Goals");
    cy.contains(".property > a.object", "Scoring periods");

};