import { a, div, labelledDiv, ul, li } from "./html.js";
import { form, hiddenInput, labelledIntegerInput, labelledStringInput, submit } from "./html-forms.js";

const XSD = name => `http://www.w3.org/2001/XMLSchema#${name}`;
const inputRenderers = {
    null: labelledStringInput,
    [XSD("string")]: labelledStringInput,
    [XSD("integer")]: labelledIntegerInput
}

const join = (joinWith, ...args) => args.filter(x => x).join(joinWith);

export function render(viewModel, context) {

    function renderForm() {
        const { props = [] } = viewModel;
        return form(
            `item ${context.mode}-mode`,
            editTargetURL(viewModel),
            hiddenInput({ name: "@id", value: viewModel.id }),
            renderCancelEditLink(viewModel),
            props.filter(prop => prop.editable).map(prop => renderProp("", prop)).join("\n"),
            submit(null, "Save")
        );
    }


    function editTargetURL(viewModel) {
        return viewModel.relativeEditTarget;
    }

    function renderCancelEditLink(viewModel) {
        return viewModel.returnURL
            ? a("back", viewModel.returnURL, "&larr; Go back")
            : "";
    }

    function renderProp(pathContext, viewModel) {
        return renderValue(pathContext, viewModel)
            || renderValues(pathContext, viewModel)
            || renderIds(pathContext, viewModel)
            || renderViewModels(pathContext, viewModel)
            || renderUnrecognised(pathContext, viewModel);
    }

    const renderValue = (pathContext, viewModel) =>
        "value" in viewModel
            ? inputRendererFor(pathContext, viewModel)
            : null;

    const renderValues = (pathContext, viewModel) =>
        "values" in viewModel
            ? labelledDiv(
                "property",
                viewModel.label,
                renderList(
                    null,
                    viewModel.values,
                    (value, i) => inputRendererFor(
                        pathContext,
                        { ...viewModel, label: "", value },
                        i
                    )
                )
            )
            : null;

    const renderIds = (pathContext, viewModel) => {
        if (!("ids" in viewModel)) return null;
        if (viewModel.multiValue) return div("error", "Don't know how to render multi id editor");
        const hasSelection = "selection" in viewModel;
        return div(
            "property",
            viewModel.label,
            viewModel.ids.displayValue || viewModel.ids.id,
            ...(hasSelection ? renderSelectionHiddenFields(viewModel) : []),
            renderSelectLink(pathContext, viewModel)
        );
    };

    function renderSelectionHiddenFields(viewModel) {
        const renderableFields = viewModel.selection.filter(selectionProp =>
            selectionProp.prop.path === "@id" || selectionProp.prop.summary
        );
        return renderableFields.map(selectionProp => {
            console.log(selectionProp);
            const { path } = selectionProp.prop;
            if (path === "@id")
                return hiddenInput({
                    name: `${viewModel.prop.path} @id`,
                    value: selectionProp.ids.id
                });
            else
                return hiddenInput({
                    name: `${viewModel.prop.path} ${path} @value`,
                    value: selectionProp.value
                });
        }
        );
    }

    function inputRendererFor(contextPath, viewModel, maybeIndex = 0) {
        const { prop, value, label } = viewModel
        const { pattern, path, dataType } = prop;
        const renderer = inputRenderers[dataType];
        if (!renderer) return "No input found for " + JSON.stringify(viewModel);

        return renderer({
            name: join(" ", contextPath, path, maybeIndex, "@value"),
            value,
            pattern,
            label
        });
    }

    function renderSelectLink(pathContext, chooseViewModel) {
        const url = new URL(location.href);
        if (chooseViewModel.encodedChooseId) {
            url.searchParams.set("data", chooseViewModel.encodedChooseId);
            url.searchParams.set("mode", chooseViewModel.chooseMode);
            url.searchParams.set("returnURL", chooseViewModel.encodedThisURL);
            url.searchParams.set("choicePath", join(" ", pathContext, chooseViewModel.choosePath));
            return a("choose", url.toString(), "select");
        }
    }

    function renderViewModels(contextPath, viewModel) {
        if (!("viewModels" in viewModel)) return null;
        return labelledDiv(
            "property",
            viewModel.label,
            renderList(null, viewModel.viewModels, ({ props }, i) => props
                .filter(prop => prop.editable)
                .map(prop => renderProp(join(" ", contextPath, viewModel.prop.path, i), prop))
                .join("\n")
            )
        );
    }

    function renderList(className, xs, parse) {
        return ul(className, ...(xs.map((x, i) => li(null, parse ? parse(x, i) : x))));
    }

    const renderUnrecognised = viewModel =>
        console.warn(`Unrecognised/empty`, viewModel) || "";

    return renderForm();
}