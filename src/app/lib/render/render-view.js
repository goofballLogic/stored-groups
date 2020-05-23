import { a, div, labelledDiv, li, span, ol } from "./html.js";

export function render(viewModel, isNested = false) {
    const { props = [] } = viewModel;
    return div(
        "item view-mode",
        isNested ? null : renderEditLink(viewModel),
        props.map(prop => renderProp(prop)).join("\n")
    );
}

function renderList(className, xs, parse) {
    return ol(className, ...(xs.map(x => li(null, parse ? parse(x) : x))));
}

function renderProp(viewModel) {
    if (viewModel.hidden) return "";
    return renderValue(viewModel)
        || renderValues(viewModel)
        || renderIds(viewModel)
        || renderViewModels(viewModel)
        || renderUnrecognised(viewModel);
}

const renderUnrecognised = viewModel =>
    console.warn(`Unrecognised/empty`, viewModel) || "";

const renderViewModels = (viewModel) =>
    "viewModels" in viewModel
        ? labelledDiv("property", viewModel.label,
            renderList("object-values", viewModel.viewModels, viewModel => render(viewModel, true))
        )
        : null;

const renderIds = viewModel =>
    "ids" in viewModel
        ? div("property", viewModel.multiValue
            ? [renderList(null, viewModel.ids, id => renderLink(id, viewModel.label))]
            : renderLink(viewModel.ids, viewModel.label)
        )
        : null;

const renderValues = viewModel =>
    "values" in viewModel
        ? labelledDiv("property", viewModel.label,
            renderList(`${viewModel.datatype}-values`, viewModel.values)
        )
        : null;

const renderValue = viewModel =>
    "value" in viewModel
        ? labelledDiv("property", viewModel.label,
            span(`${viewModel.datatype}-value`, viewModel.value)
        )
        : null;

const whitelisted = ["tenant", "data"];

function cleanURL() {
    const url = new URL(location.href);
    Array.from(url.searchParams.keys())
        .filter(key => !whitelisted.includes(key))
        .forEach(key => { url.searchParams.delete(key); });
    return url;
}

function renderLink(idViewModel, label) {
    if (idViewModel.encodedRelativeId) {
        const url = cleanURL();
        url.searchParams.set("data", idViewModel.encodedRelativeId);
        return a("object", url.toString(), label);
    }
}

function renderEditLink(editViewModel) {

    if (editViewModel.encodedRelativeId && editViewModel.editMode) {
        const url = cleanURL();
        url.searchParams.set("data", editViewModel.encodedRelativeId);
        url.searchParams.set("mode", editViewModel.editMode);
        url.searchParams.set("returnURL", editViewModel.encodedThisURL);
        return a("edit", url.toString(), "Edit");
    }
}