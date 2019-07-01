module.exports = {

    async fetchSchemaFor( doc ) {

console.log( "doc", doc );
        return doc && doc.schema;

    }

}