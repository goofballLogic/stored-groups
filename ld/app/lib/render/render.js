import { pre } from "./html.js";
import { render as renderView, render } from "./render-view.js";
import { render as renderEditor } from "./render-editor.js";
import { render as renderSelect } from "./render-select.js";

export default function(container, viewModels, context) {
    viewModels = Array.isArray(viewModels) ? viewModels : [viewModels];
    container.innerHTML = viewModels
        .map(viewModel => renderFor(viewModel, context)(viewModel, context))
        .join("\n\n");
}

export function renderError(container, err) {
    container.innerHTML = pre("error", err.stack.replace(/</g, "&lt;"));
}

const renderFor = (viewModel, context) =>
    context.mode === viewModel.selectMode
        ? renderSelect
        : context.mode === viewModel.editMode
            ? renderEditor
            : renderView;