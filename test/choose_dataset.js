import DOM from "jsdom";
import run from "../ld/app/app.js";

describe("In order to choose a dataset", () => {

    describe("Given I navigate to the root of the application", () => {

        const context = {};
        let doc = new DOM();
        beforeEach(() => {

            run();

        });

        it("Should have thrown an error", () => {

        });
        
    });

});