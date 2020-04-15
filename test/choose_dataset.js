import jsdom from "jsdom";
import run from "../ld/app/app.js";

describe("In order to choose a dataset", () => {

    describe("Given I navigate to the root of the application", () => {

        const context = {};
        let doc = new jsdom.JSDOM();
        beforeEach(async () => {

            await run();

        });

        it("Should have thrown an error", () => {

        });
        
    });

});