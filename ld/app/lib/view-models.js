import DataSet from "./model/DataSet.js";

function maybeExpand(labelTemplate, query) {
    return labelTemplate && labelTemplate.replace(/\{([^}]*)\}/, (_, path) => query.query(path));
}

function findChooseableId(prop, query, tenant, context) {
    const chooseFrom = prop.chooseFrom;
    const chooseFromId = query.query(`${chooseFrom} @id`);
    if(!chooseFromId) return undefined;
    return context.encode(tenant.relativeId(chooseFromId));
}

export default function buildViewModels(dataSets, tenant, shapeIndex, context) {
    return dataSets.map(dataSet => {
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
                const digest = { prop, multiValue, editable: !prop.immutable };
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
                            const displayValue = maybeExpand(prop.valueTemplate, q);
                            return { id, relativeId, encodedRelativeId, displayValue };
                        });
                        if (multiValue) {
                            digest.ids = ids;
                            digest.editable = false;
                        } else {
                            digest.ids = ids[0];
                            if (prop.path === "@id") {
                                digest.editable = false;
                            } else {
                                digest.encodedChooseId = findChooseableId(prop, dataSet.ld, tenant, context);
                                digest.chooseMode = "select";
                                digest.editable = !!digest.encodedChooseId;
                            }
                        }
                        break;
                    case "http://www.w3.org/ns/shacl#BlankNode":
                        const nestedDataSets = queries.map(query => dataSet.buildSubset({ query }));
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