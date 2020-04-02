import { a, div, labelledDiv } from "./html.js";
import { form, hiddenInput, labelledStringInput, submit } from "./html-forms.js";

const XSD = name => `http://www.w3.org/2001/XMLSchema#${name}`;
const inputRenderers = {
    [XSD("string")]: labelledStringInput
}

export function render(viewModel, context) {
    const { props = [] } = viewModel;
    return form(
        `item ${context.mode}-mode`,
        editTargetURL(viewModel),
        renderCancelEditLink(),
        hiddenInput({ prop: { path: "@id" }, value: viewModel.id }),
        props.filter(prop => prop.editable).map(prop => renderProp(prop, context)).join("\n"),
        submit(null, "Save")
    );
}

function editTargetURL(viewModel) {
    return viewModel.relativeEditTarget;
}

function renderCancelEditLink() {
    return a("back", "javascript: history.back();", "&larr; Go back");
}

function renderProp(viewModel, context) {
    return renderValue(viewModel)
        || renderValues(viewModel)
        || renderIds(viewModel)
        || renderViewModels(viewModel, context)
        || renderUnrecognised(viewModel);
}

const renderValue = viewModel =>
    "value" in viewModel
        ? inputRendererFor(viewModel)
        : null;

const renderValues = viewModel =>
    "values" in viewModel
        ? labelledDiv("property", viewModel.label, renderList(null, viewModel))
        : null;

const renderIds = viewModel =>
    "ids" in viewModel
        ? div("property",
            viewModel.label,
            viewModel.ids.displayValue || viewModel.ids.id,
            viewModel.multiValue
                ? "Don't know how to render multi id editor"
                : renderChooseLink(viewModel)
        )
        : null;

function inputRendererFor(viewModel) {
    const renderer = inputRenderers[viewModel.prop.dataType];
    if(!renderer) return "No input found for " + JSON.stringify(viewModel);
    return renderer(viewModel);
}

function renderChooseLink(chooseViewModel) {
    const url = new URL(location.href);
    if (chooseViewModel.encodedChooseId) {
        url.searchParams.set("data", chooseViewModel.encodedChooseId);
        url.searchParams.set("mode", chooseViewModel.chooseMode);
        return a("choose", url.toString(), "select");
    }
}