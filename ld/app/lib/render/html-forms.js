import { maybeClass, tag } from "./html.js";

// TODO: escape attribute values

export const form = (className, targetUrl, ...content) =>
    `<form${maybeClass(className)} action="${targetUrl}" method="POST">
        ${content.join(" ")}
    </form>`;

export const choiceForm = (className, targetUrl, ...content) =>
    `<form${maybeClass(className)} action="${targetUrl}" method="GET">
        ${content.join(" ")}
    </form>`;

const input = ({ type, name, pattern, value }) =>
    `<input type="${type}" name="${name}" value="${value}" ${pattern ? `pattern="${pattern}"` : ""} />`;

const label = (className, labelText, input) =>
    `<label${maybeClass(className)}>
        <span>${labelText}</span>
        ${input}
    </label>`;

export const hiddenInput = (viewModelOrKey, maybeValue) =>
    input({
        "type": "hidden",
        ...(
            (typeof viewModelOrKey === "object")
                ? { name: viewModelOrKey.prop.path, value: viewModelOrKey.value }
                : { name: viewModelOrKey, value: maybeValue }
        )
    });

const stringInput = viewModel =>
    input({
        "type": "text",
        "name": `${viewModel.prop.path} @value`,
        "pattern": viewModel.prop.pattern,
        "value": viewModel.value
    });

export const labelledStringInput = viewModel =>
    label("property", viewModel.label, stringInput(viewModel));

export const submit = (className, ...content) =>
    `<button${maybeClass(className)}>${content.join(" ")}</button>`;

export const associatedRadioInput = ({ className, label: labelText, name, value }) =>
    label(className, labelText, input({ type: "radio", name, value }));