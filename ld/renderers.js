const xsd = "http://www.w3.org/2001/XMLSchema#";
const xsdString = `${xsd}string`;
const xsdDateTime = `${xsd}dateTime`;
const xsdInteger = `${xsd}integer`;

const sh = "http://www.w3.org/ns/shacl#";
const shIRI = `${sh}IRI`;

const viewerRenderers = {

};
const editorRenderers = {
    [xsdString]: x => inputRenderer(x, "text"),
    [xsdDateTime]: x => inputRenderer(x, "date"),
    [xsdInteger]: x => inputRenderer(x, "integer", "1")
};

const stringify = args => args.filter(x => x).join("");

const HTML = {
    "label": (...args) => `<label>${stringify(args)}</label>`,
    "input_int": inputName => `<input type="number" name="${inputName} step="1" pattern="^\\d+$" />`,
    "input": (inputType, inputName) => `<input type="${inputType}" name="${inputName}" />`,
    "span": (className, ...args) => `<span class="${className}">${stringify(args)}</span>`,
    "div": (className, ...args) => `<div class="${className}">${stringify(args)}</div>`,
    "p": (className, ...args) => `<p class="${className}">${stringify(args)}</p>`,
    "a": (className, href, ...args) => `<a class="${className}" href="${href}">${stringify(args)}</a>`
};

export const renderPropEditor = propQuery => renderClassPropEditor(propQuery) || renderLiteralPropEditor(propQuery);

export const renderPropViewer = (propQuery, objectQuery) => renderClassPropViewer(propQuery, objectQuery) || renderLiteralPropViewer(propQuery, objectQuery);

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
            HTML.a("linked-object", `?mode=view&id=${btoa(id)}`,label),
            description
        );

    }
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
    return HTML.div("object-index", HTML.a("object-index", `?mode=browse&class=${btoa(shapeClass)}&at=${Date.now()}`, labelTemplate || shapeClass));

}

function renderLiteralPropViewer(propQuery, objectQuery) {
    const dataType = propQuery.query("sh:dataType @id") || xsdString;
    const renderer = viewerRenderers[dataType];
    const controls = renderer ? renderer(propQuery) : dataType;
    return HTML.div("property-controls", controls);
}

function renderLiteralPropEditor(propQuery) {
    const dataType = propQuery.query("sh:dataType @id") || xsdString;
    const renderer = editorRenderers[dataType];
    const controls = renderer ? renderer(propQuery) : dataType;
    return HTML.div("property-controls", controls);
}

function inputRenderer(propQuery, inputType) {
    const path = propQuery.query("sh:path @id");
    const labelTemplate = propQuery.query("sh:labelTemplate @value");
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
    const input = inputType == "integer" ? HTML.input_int(path) : HTML.input(inputType, path);
    const maybeDescription =  description && HTML.p("property-description", description);
    return HTML.label(
        label,
        input,
        maybeDescription
    );
}