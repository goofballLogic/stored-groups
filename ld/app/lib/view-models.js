import DataSet from "./model/DataSet.js";

export default function buildViewModels(dataSets, tenant, shapeIndex, context) {
    return dataSets.map(dataSet => {
        const id = dataSet.id();
        const relativeId = id && tenant.relativeId(id);
        return ({
            id,
            relativeId,
            encodedRelativeId: id && context.encode(relativeId),
            types: dataSet.types,
            props: dataSet.properties(shapeIndex).map(prop => {
                const multiValue = prop.maxCount !== 1;
                const digest = { prop, multiValue };
                const queries = dataSet.ld.queryAll(prop.path);
                if (!queries.length )
                    return digest;
                digest.label = prop.labelTemplate || prop.path;

                switch (prop.nodeKind) {
                    case null:
                        if (!multiValue)
                            digest.value = queries[0].query("> @value");
                        else
                            digest.values = queries.map(q => q.query("> @value"));
                        break;
                    case "http://www.w3.org/ns/shacl#IRI":
                        console.log(multiValue, queries.map(q => q.json()), queries.map(q => q.query("> @id")));
                        const ids = queries.map(q => {
                            const id = q.query("> @id");
                            const relativeId = tenant.relativeId(id);
                            const encodedRelativeId = context.encode(relativeId);
                            return { id, relativeId, encodedRelativeId };
                        });
                        if(!multiValue)
                            digest.ids = ids[0];
                        else
                            digest.ids = ids;
                        console.log(digest);
                        break;
                    case "http://www.w3.org/ns/shacl#BlankNode":
                        const nestedDataSets = queries.map(query => new DataSet({ query }));
                        digest.viewModels = buildViewModels(nestedDataSets, tenant, shapeIndex, context);
                        break;
                    default:
                        throw new Error("Unhandled nodeKind - " + JSON.stringify(prop));
                }
                return digest;
            })
        });
    });
}