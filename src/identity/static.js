const data = require( "../data/flat-file" );

module.exports = {

    run() {

        const user = { id: "test-user" };
        data.login( user );

    }

};