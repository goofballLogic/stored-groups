
export default function buildViewModels(dataSets, tenant, shapeIndex, context) {
    return dataSets.map(dataSet => {
        const id = dataSet.id();
        const relativeId = tenant.relativeId(id);
        return ({
            id,
            relativeId,
            encodedRelativeId: context.encode(relativeId),
            types: dataSet.types,
            props: dataSet.properties(shapeIndex).map(prop => {
                const digest = { prop };
                const query = dataSet.ld.query(prop.path);
                if (!query)
                    return digest;
                digest.label = prop.labelTemplate || prop.path;
                switch (prop.nodeKind) {
                    case null:
                        if (prop.maxCount === 1)
                            digest.value = query.query("> @value");
                        else
                            throw new Error("Unhandled maxCount !== 1");
                        break;
                    case "http://www.w3.org/ns/shacl#IRI":
                        digest.id = query.query("> @id");
                        digest.relativeId = tenant.relativeId(digest.id);
                        digest.encodedRelativeId = context.encode(digest.relativeId);
                        break;
                    default:
                        throw new Error("Unhandled nodeKind - " + prop.nodeKind);
                }
                digest.multiValue = prop.maxCount !== 1;
                return digest;
            })
        });
    });
}