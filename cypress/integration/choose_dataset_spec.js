import providers from "./src/providers";

describe("Given the app is configured to use the local-dev provider", () => {

    let provider = providers["local-dev"];

    describe("When I navigate to the root of the app", () => {

        beforeEach(() => cy.visit(`${provider.href}?tenant=${btoa(provider.tenant)}`));

        it("Then it displays a list of teams", () => {

            cy.contains("Your teams");
            cy.contains("The Eggheads");

        });

        describe("And I choose to open a team", () => {

            beforeEach(() => cy.contains("a", "The Eggheads").click());

            it("Then it should display a self-link", () => {

                cy.contains("a", "The Eggheads");
                
            });

            it("Then it should display details of the team", () => {

                cy.contains(".property-value", "The Eggheads");

            });

            it("Then it should link to objects within the team (e.g. current scoresheet)", () => {

                cy.contains("a", "Current scoresheet");

            });

            it("Then it should link to collections within the team (e.g. team members)", () => {

                cy.contains("a", "Team members");
                cy.contains("a", "Scoresheets");
                cy.contains("a", "Scores");
                cy.contains("a", "Goals");
                cy.contains("a", "Scoring periods");

            });

        });

    });

});