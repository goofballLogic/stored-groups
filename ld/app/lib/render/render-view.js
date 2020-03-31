import { a, div, labelledDiv, li, ul } from "./html.js";

export function render(viewModel) {
    const { props = [] } = viewModel;
    return div(
        `item view-mode`,
        renderEditLink(viewModel),
        props.map(prop => renderProp(prop)).join("\n")
    );
}

function renderList(className, xs, parse) {
    return ul(className, ...(xs.map(x => li(null, parse ? parse(x) : x))));
}

function renderProp(viewModel) {
    return renderValue(viewModel)
        || renderValues(viewModel)
        || renderIds(viewModel)
        || renderViewModels(viewModel)
        || renderUnrecognised(viewModel);
}

const renderUnrecognised = viewModel =>
    console.warn(`Unrecognised/empty`, viewModel) || "";

const renderViewModels = (viewModel, context) =>
    "viewModels" in viewModel
        ? labelledDiv("property", viewModel.label, renderList(null, viewModel.viewModels, viewModel => render(viewModel, context)))
        : null;

const renderIds = viewModel =>
    "ids" in viewModel
        ? div("property", viewModel.multiValue
            ? renderList(null, viewModel.ids, id => renderLink(id, viewModel.label))
            : renderLink(viewModel.ids, viewModel.label)
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
    if (idViewModel.encodedRelativeId) {
        url.searchParams.set("data", idViewModel.encodedRelativeId);
        return a("object", url.toString(), label);
    }
}

function renderEditLink(editViewModel) {
    const url = new URL(location.href);
    if (editViewModel.encodedRelativeId && editViewModel.editMode) {
        url.searchParams.set("data", editViewModel.encodedRelativeId);
        url.searchParams.set("mode", editViewModel.editMode);
        return a("edit", url.toString(), "Edit");
    }
}