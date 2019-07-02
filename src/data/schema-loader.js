const { sys } = require( "../domain/symbols" );

module.exports = {

    async fetchSchemaFor( doc ) {

        return sys( doc, "schema" );

    }

}