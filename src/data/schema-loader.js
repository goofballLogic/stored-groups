const { systemPrefix } = require( "../domain/symbols" );

module.exports = {

    async fetchSchemaFor( doc ) {

        return doc && doc[ `${systemPrefix}schema` ];

    }

}