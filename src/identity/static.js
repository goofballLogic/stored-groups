const { JSDOM } = require( "jsdom" );
const data = require( "../data/flat-file" );

module.exports = {

    run() {

        const { window } = new JSDOM(
            "<!DOCTYPE html><html><body><main></main></body></html>",
            { url: "http://dev.openteamspace.com/console" }
        );
        const user = { id: "test-user" };
        data.configure( { window } );
        data.login( user );

    }

};