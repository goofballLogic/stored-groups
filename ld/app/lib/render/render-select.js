import { a, div, labelledDiv, li, ul } from "./html.js";
import { associatedRadioInput, choiceForm, submit, hiddenInput } from "./html-forms.js";

export function render(viewModel) {
    if(viewModel.types.some(t => t === "Collection")) {
        return renderCollectionSelect(viewModel);
    }
    return labelledDiv("error", "Don't know how to render a chooser for " + JSON.stringify(viewModel));
}

function hiddenReturnURLFields(url) {
    return Array.from((new URL(url, location.href)).searchParams)
        .map(pair => hiddenInput(...pair))
        .join("\n");
}

function renderCollectionSelect(viewModel) {
    const { props = [] } = viewModel;
    return choiceForm(
        `item select-mode`,
        viewModel.selectReturnURL,
        hiddenReturnURLFields(viewModel.selectReturnURL),
        hiddenInput("choicePath", viewModel.encodedChoicePath),
        props.map(prop => renderProp(prop)).join("\n"),
        submit(null, "Submit")
    );
}

function renderList(className, xs, parse) {
    return ul(className, ...(xs.map(x => li(null, parse ? parse(x) : x))));
}

function renderProp(viewModel) {
    if(viewModel.hidden) return "";
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
        ? labelledDiv("property", viewModel.label, renderList(
            null,
            viewModel.viewModels,
            viewModel => renderChoice(viewModel)
        ))
        : null;

function renderChoice(viewModel) {
    const { props = [] } = viewModel;
    return div(
        "choice",
        associatedRadioInput({
            name: "choice",
            value: viewModel.encodedRelativeId,
            label: "Choose"
        }),
        props.map(prop => renderProp(prop)).join("\n")
    );
}

const renderIds = viewModel =>
    "ids" in viewModel
        ? console.log(viewModel) || div("property", viewModel.multiValue
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

const whitelisted = [ "tenant", "data" ];
function cleanURL() {
    const url = new URL(location.href);
    Array.from(url.searchParams.keys())
        .filter(key => !whitelisted.includes(key))
        .forEach(key => { url.searchParams.delete(key); });
    return url;
}

function renderLink(idViewModel, label) {
    if (!idViewModel.encodedRelativeId) return null;
    const url = cleanURL();
    url.searchParams.set("data", idViewModel.encodedRelativeId);
    return a("object", url.toString(), label);
}