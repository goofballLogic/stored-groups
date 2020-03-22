import routes from "./routes/index.js";

const xsd = "http://www.w3.org/2001/XMLSchema#";
const xsdString = `${xsd}string`;
const xsdDateTime = `${xsd}dateTime`;
const xsdInteger = `${xsd}integer`;

const sh = "http://www.w3.org/ns/shacl#";
const shIRI = `${sh}IRI`;

const vocabBase = "http://openteamspace.com/vocab#";
const vocab = x => `${vocabBase}${x}`;
const unvocab = x => x.startsWith(vocabBase) ? x.substring(vocabBase.length, 0) : x;

const viewerRenderers = {
    [xsdString]: (p, o) => viewRenderer(p, o, xsdString),
    [xsdDateTime]: (p, o) => viewRenderer(p, o, xsdDateTime)
};

const valueFormatters = {
    [xsdString]: formatStringForView,
    [xsdDateTime]: formatDateTimeForView
};

const editorRenderers = {
    [xsdString]: (p, o) => inputRenderer(p, o, xsdString),
    [xsdDateTime]: (p, o) => inputRenderer(p, o, xsdDateTime),
    [xsdInteger]: (p, o) => inputRenderer(p, o, xsdInteger)
};

const stringify = args => args.filter(x => x).join("");
const maybeValue = value => value == null ? "" : `value="${value}"`;

const HTML = {
    "label": (...args) => `<label>${stringify(args)}</label>`,
    "input_int": (inputName, value) => `<input type="number" name="${inputName} step="1" pattern="^\\d+$" ${maybeValue(value)} />`,
    "input": (inputType, inputName, value) => `<input type="${inputType}" name="${inputName}" ${maybeValue(value)} />`,
    "span": (className, ...args) => `<span class="${className}">${stringify(args)}</span>`,
    "div": (className, ...args) => `<div class="${className}">${stringify(args)}</div>`,
    "p": (className, ...args) => `<p class="${className}">${stringify(args)}</p>`,
    "a": (className, href, ...args) => `<a class="${className}" href="${href}">${stringify(args)}</a>`,
    "ul": (className, ...liContents) => `<ul class="${className}">${stringify(liContents.map(x => HTML.li(null, x)))}</ul>`,
    "li": (className, ...args) => `<li class="${className}">${stringify(args)}</li>`
};

export const renderPropEditor = (propQuery, objectQuery) =>
    renderClassPropEditor(propQuery, objectQuery)
    || renderLiteralPropEditor(propQuery, objectQuery);

export const renderPropViewer = (propQuery, objectQuery) =>
    renderCollectionPropViewer(propQuery, objectQuery)
    || renderClassPropViewer(propQuery, objectQuery)
    || renderLiteralPropViewer(propQuery, objectQuery);

export const renderChildViewerLink = (objectQuery) =>
    renderObjectLink(objectQuery);

const viewLink = id =>
    routes.view.url(id);
const browseChildLink = (childId, prop, parentId) =>
    routes["view-collection"].url(childId, prop, parentId);

function renderCollectionPropViewer(propQuery, objectQuery) {
    const id = objectQuery.query("> @id");
    const shapeClass = propQuery.query("sh:class @id");
    if (!shapeClass) return undefined;
    const nodeKind = propQuery.query("sh:nodeKind @id");
    if (nodeKind !== shIRI) return undefined;
    const maxCount = propQuery.query("sh:maxCount @value");
    if (maxCount < 2) return undefined;
    const path = propQuery.query("sh:path @id");
    if (!path) return undefined;
    const label = propQuery.query("sh:labelTemplate @value") || path;
    const owner = objectQuery.query("> ots:name @value") || objectQuery.query("> @id");
    const childId = objectQuery.query(`> ${path} @id`);
    return HTML.div(
        "",
        HTML.a(
            "view-child",
            browseChildLink(childId, path, id),
            label
        )
    );
}

function renderClassPropViewer(propQuery, objectQuery) {

    const shapeClass = propQuery.query("sh:class @id");
    if (!shapeClass) return undefined;

    const path = propQuery.query("sh:path @id");
    const nodeKind = propQuery.query("sh:nodeKind @id");
    const objectPropQuery = objectQuery.query(`>${path}`);
    const description = propQuery.query("sh:description @value");
    const label = propQuery.query("sh:labelTemplate @value") || path;
    const id = objectPropQuery.query("@id")
    if(nodeKind == shIRI) {

        return HTML.div(
            "class-property",
            HTML.a(
                "linked-object",
                viewLink(id),
                label
            ),
            description
        );

    }
}

function renderObjectLink(objectQuery) {

    const id = objectQuery.query(">@id");
    if (!id) return undefined;
    const objectName = objectQuery.query(">ots:name @value") || "??";
    return HTML.a(
        "child-object",
        viewLink(id),
        objectName
    );
}

function renderClassPropEditor(propQuery) {
    const shapeClass = propQuery.query("sh:class @id");
    if (!shapeClass) return undefined;

    const nodeKind = propQuery.query("sh:nodeKind @id");
    if(nodeKind == shIRI) {

        const description = propQuery.query("sh:description @value");
        return HTML.div(
            "class-property-editor",
            "class prop",
            HTML.p("", shapeClass),
            description && HTML.span("property-description", description)
        );

    }

    const labelTemplate = propQuery.query("sh:labelTemplate @value");
    return HTML.div(
        "object-index",
        HTML.a(
            "object-index",
            browseClassLink(shapeClass),
            labelTemplate || shapeClass
        )
    );

}

function renderLiteralPropViewer(propQuery, objectQuery) {
    const dataType = propQuery.query("sh:dataType @id") || xsdString;
    const renderer = viewerRenderers[dataType];
    const controls = renderer ? renderer(propQuery, objectQuery) : dataType;
    return HTML.div("property-controls", controls);
}

function renderLiteralPropEditor(propQuery, objectQuery) {
    const dataType = propQuery.query("sh:dataType @id") || xsdString;
    const renderer = editorRenderers[dataType];
    const controls = renderer ? renderer(propQuery, objectQuery) : dataType;
    return HTML.div("property-controls", controls);
}

const createdProp = vocab("created");

function viewRenderer(propQuery, objectQuery, inputType) {
    const path = propQuery.query("sh:path @id");

    const labelTemplate = propQuery.query("sh:labelTemplate @value");
    const label = labelTemplate || (path === createdProp ? "Created" : path);
    const minCount = parseInt(propQuery.query("sh:minCount @value") || "0");
    const maxCount = parseInt(propQuery.query("sh:maxCount @value") || "1");
    const description = propQuery.query("sh:description @value");
    const rawValues = objectQuery ? objectQuery.queryAll(`> ${path} > @value`): [];
    const values = rawValues.map(x => formatForView(x, inputType));

    if (Math.max(values.length, maxCount) > 5) {

        return HTML.a(
            "linked-collection",
            "#",
            label
        );

    }
    return HTML.div(
        "prop",
        label,
        ": ",
        ...values
    );
}


function formatForView(value, inputType) {

    const formatter = valueFormatters[inputType] || valueFormatters[xsdString];
    return formatter(value);

}

function formatStringForView(value) {

    return value || "";

}

function formatDateTimeForView(value) {

    const parsed = new Date(value);
    return parsed.toLocaleDateString([], { dateStyle: "full" });

}

function inputRenderer(propQuery, objectQuery, inputType) {
    const path = propQuery.query("sh:path @id");

    if(path == vocab("created")) {
        return renderPropViewer(propQuery, objectQuery);
    }
    const labelTemplate = propQuery.query("sh:labelTemplate @value");

    const pathQuery = objectQuery && objectQuery.query(`> ${path}`);
    const value = pathQuery ? pathQuery.query(">@value") : null;

    const label = labelTemplate || path;
    const minCount = parseInt(propQuery.query("sh:minCount @value") || "0");
    const maxCount = parseInt(propQuery.query("sh:maxCount @value") || "1");
    if(minCount > 1) {
        return inputType + " with minCount " + minCount;
    }
    if(maxCount > 1) {
        return inputType + " with maxCount " + maxCount;
    }
    const description = propQuery.query("sh:description @value");

    const input = htmlInputRenderer(path, value, inputType);
    const maybeDescription =  description && HTML.p("property-description", description);
    return HTML.label(
        label,
        input,
        maybeDescription
    );
}

function htmlInputRenderer(path, value, inputType) {
    switch(inputType) {
        case xsdInteger:
            return HTML.input_int(path, value);
        case xsdDateTime:
            return HTML.input("datetime-local", path, value && value.substring(0, 19));
        case xsdString:
            return HTML.input("text", path, value);
        default:
            throw new Error(`Unrecognised: ${inputType}`);
    }
}