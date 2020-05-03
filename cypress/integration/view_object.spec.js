import providers from "../support/src/providers";

describe("View an object", () => {

    describe("Given the app is configured to use the local-dev provider", () => {

        let provider = providers["local-dev"];

        describe("When I navigate to a plain object", () => {

            beforeEach(() => {
                
                cy.visit(`${provider.href}?tenant=${btoa(provider.tenant)}`);
                cy.contains("a", "The Eggheads").click();

            });

            it("Then it should display a self-link to the object", () => {

                cy.contains("a", "The Eggheads");
                
            });

            it("Then it should simple property values", () => {

                cy.contains(".property-value", "The Eggheads");

            });

            it("Then it should link to objects within the object (e.g. team -> current scoresheet)", () => {

                cy.contains("a", "Current scoresheet");

            });

            it("Then it should link to collections within the object (e.g. team -> team members)", () => {

                cy.contains("a", "Team members");
                cy.contains("a", "Scoresheets");
                cy.contains("a", "Scores");
                cy.contains("a", "Goals");
                cy.contains("a", "Scoring periods");

            });

        });

    });

});
