const maybeClass = className =>
    className ? ` class="${className}"` : "";

const a = (className, href, ...content) =>
    `<a${maybeClass(className)} href="${href}">${content.join(" ")}</a>`;

const span = (className, ...content) =>
    `<span${maybeClass(className)}>${content.join(" ")}</span>`;

const div = (className, ...content) =>
    `<div${maybeClass(className)}>${content.join(" ")}</div>`;

const li = (className, ...content) =>
    `<li${maybeClass(className)}>${content.join(" ")}</li>`;

const ul = (className, ...content) =>
    `<ul${maybeClass(className)}>${content.join(" ")}</ul>`;

const pre = (className, ...content) =>
    `<pre${maybeClass(className)}>${content.join(" ")}</pre>`;

const labelledDiv = (className, labelText, ...content) =>
    div(className, span("label", labelText), div("property-value", ...content));

export default function(container, viewModels) {
    viewModels = Array.isArray(viewModels) ? viewModels : [ viewModels ];
    container.innerHTML = viewModels.map(render).join("\n\n");
}

export function renderError(container, err) {
    container.innerHTML = pre("error", err.stack);
}

function renderList(className, xs, parse) {
    console.log(className, xs);
    return ul(className, ...(xs.map(x => li(null, parse ? parse(x) : x))));
}

function render(viewModel) {
    const { props = [] } = viewModel;
    return props.map(renderProp).join("\n");
}

function renderProp(viewModel) {
    return renderValue(viewModel)
        || renderValues(viewModel)
        || renderIds(viewModel)
        || renderViewModels(viewModel)
        || renderUnrecognised(viewModel);
}

const renderUnrecognised = viewModel =>
    "Unrecognised <pre>" + JSON.stringify(viewModel, null, 3) + "</pre>";

const renderViewModels = viewModel =>
    "viewModels" in viewModel
        ? labelledDiv("property", viewModel.label, renderList(null, viewModel.viewModels, render))
        : null;

const renderIds = viewModel =>
    "ids" in viewModel
        ? div("property", viewModel.multiValue
            ? renderList(null, viewModel.ids, id => renderLink(id, viewModel.label))
            : renderLink(viewModel.ids, viewModel.Label)
        )
        : null;

const renderValues = viewModel =>
    "values" in viewModel
        ? labelledDiv("property", viewModel.label, renderList(null, viewModel.values))
        : null;

const renderValue = viewModel =>
    "value" in viewModel
        ? labelledDiv("property", viewModel.label, viewModel.value)
        : null;

function renderLink(idViewModel, label) {
    const url = new URL(location.href);
    url.searchParams.set("data", idViewModel.encodedRelativeId);
    return a("object", url.toString(), label);
}