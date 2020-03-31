import DataSet from "./model/DataSet.js";

function maybeExpand(labelTemplate, query) {
    return labelTemplate && labelTemplate.replace(/\{([^}]*)\}/, (_, path) => query.query(path));
}

export default function buildViewModels(dataSets, tenant, shapeIndex, context) {
    return dataSets.map(dataSet => {
        console.log(dataSet);
        const id = dataSet.id();
        const relativeId = id && tenant.relativeId(id);
        const relativeEditTarget = dataSet.editsUrl;
        return ({
            id,
            relativeId,
            relativeEditTarget,
            encodedRelativeId: id && context.encode(relativeId),
            editMode: "edit",
            types: dataSet.types,
            props: dataSet.properties(shapeIndex).map(prop => {
                const multiValue = prop.maxCount !== 1;
                const digest = { prop, multiValue, editable: true };
                const queries = dataSet.ld.queryAll(`> ${prop.path}`);
                if (!queries.length )
                    return digest;
                digest.label = maybeExpand(prop.labelTemplate, dataSet.ld) || prop.path;
                switch (prop.nodeKind) {
                    case null:
                        if (!multiValue)
                            digest.value = queries[0].query("> @value");
                        else
                            digest.values = queries.map(q => q.query("> @value"));
                        break;
                    case "http://www.w3.org/ns/shacl#IRI":
                        const ids = queries.map(q => {
                            const id = (typeof q === "string") ? q : q.query("> @id");
                            const relativeId = tenant.relativeId(id);
                            const encodedRelativeId = context.encode(relativeId);
                            return { id, relativeId, encodedRelativeId };
                        });
                        if(!multiValue)
                            digest.ids = ids[0];
                        else
                            digest.ids = ids;
                        digest.editable = !multiValue && prop.path !== "@id";
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