const maybeClass = className =>
    className ? ` class="${className}"` : "";

const a = (className, href, ...content) =>
    `<a${maybeClass(className)} href="${href}">${content.join(" ")}</a>`;

const span = (className, ...content) =>
    `<span${maybeClass(className)}>${content.join(" ")}</span>`;

const div = (className, ...content) =>
    `<div${maybeClass(className)}>${content.join(" ")}</div>`;

const labelledDiv = (className, labelText, ...content) =>
    div(className, span("label", labelText), div("property-value", ...content));

export default function(container, viewModels) {
    viewModels = Array.isArray(viewModels) ? viewModels : [ viewModels ];
    container.innerHTML = viewModels.map(render).join("\n\n");
}

function render(viewModel) {
    const { props = [] } = viewModel;
    return props.map(renderProp).join("\n");
}

function renderProp(viewModel) {
    return "value" in viewModel
        ? labelledDiv("property", viewModel.label, viewModel.value)
        : "id" in viewModel
            ? labelledDiv("property", null, renderLink(viewModel))
            : "Unrecognised " + JSON.stringify(viewModel);
}

function renderLink(viewModel) {
    const url = new URL(location.href);
    url.searchParams.set("data", viewModel.encodedRelativeId);
    return a("object", url.toString(), viewModel.label);
}