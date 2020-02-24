export function indexShapesByTargetClass(schemaQuery, context) {

    const addShape = addShapeToIndex(context);
    return schemaQuery.queryAll("sh:targetClass")
        .map(prop => [ prop.query("@id"), prop.parent() ])
        .reduce(addShape, {
            shapeForObject: function(objQuery) { return this[currentShapeName(context, objQuery)]; }
        });
}

function currentShapeName(context, objectQuery) {
    if (!objectQuery) return null;
    const objClass = objectQuery.query(">@type").filter(t => t.startsWith(context.ots))[0];
    return objClass && objClass.substring(context.ots.length);
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