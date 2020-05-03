import providers from "../support/src/providers";

describe("Choosing a data set", () => {

    describe("Given the app is configured to use the local-dev provider", () => {

        let provider = providers["local-dev"];

        describe("When I navigate to the root of the app", () => {

            beforeEach(() => cy.visit(`${provider.href}?tenant=${btoa(provider.tenant)}`));

            it("Then it displays a list of data sets", () => {

                cy.contains("Your teams");
                cy.contains("The Eggheads");

            });

            describe("And I choose to open a dataset", () => {

                beforeEach(() => cy.contains("a", "The Eggheads").click());

                it("Then it should display a self-link to the opened dataset", () => {

                    cy.location().then(location => {
                        
                        console.log("LOCATION", location);
                        cy.contains("a", "The Eggheads")
                            .should("have.attr", "href", location.href);

                    });
                    
                });

                describe("And I follow the Home link", () => {

                    beforeEach(() => cy.contains("a", "Home").click());

                    it("Then I should be back at the choosing page", () => {

                        cy.contains("Your teams");
                        cy.contains("The Eggheads");

                    });
                    
                });

            });

        });

    });

});