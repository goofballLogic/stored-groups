import jsdom from "jsdom";
import run from "../ld/app/app.js";
import assert from "assert";

describe("In order to choose a dataset", () => {

    describe("Given I navigate to the root of the application", () => {

        const context = {};
        let doc = new jsdom.JSDOM();
        let lastCaught;

        beforeEach(async () => {

            try {
                await run();
            } catch(err) {
                lastCaught = err;
            }

        });

        it("Should have thrown an error", () => assert.ok(lastCaught));
        
    });

});