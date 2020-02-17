export function indexShapesByTargetClass(schemaQuery, context) {

    const addShape = addShapeToIndex(context);
    return schemaQuery.queryAll("sh:targetClass")
        .map(prop => [ prop.query("@id"), prop.parent() ])
        .reduce(addShape, {});
}

function addShapeToIndex(context) {
    const vocab = context.ots;
    const vocabLength = vocab.length;
    const maybeMinify = id => id.startsWith(vocab) ? `${id.substring(vocabLength)}` : id;
    return function( index, [ id, value ] ) {
        const minifiedId = maybeMinify(id);
        return hashWithPair( index, [ minifiedId, value ]);
    }
}

function hashWithPair( hash, [ key, value ] ) {
    return {
        ...hash,
        [ key ]: value
    };
}