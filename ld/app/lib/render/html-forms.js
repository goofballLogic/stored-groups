import { maybeClass, tag } from "./html.js";

// TODO: escape attribute values

export const form = (className, targetUrl, cancelEditLink, ...content) =>
    `<form${maybeClass(className)} action="${targetUrl}" method="POST">
        ${content.join(" ")}
    </form>`;

const input = ({ type, name, pattern, value }) =>
    `<input type="${type}" name="${name}" value="${value}" ${pattern ? `pattern="${pattern}"` : ""} />`;

const label = (className, labelText, input) =>
    `<label${maybeClass(className)}>
        <span>${labelText}</span>
        ${input}
    </label>`;

export const hiddenInput = viewModel =>
    input({
        "type": "hidden",
        "name": viewModel.prop.path,
        "value": viewModel.value
    });

const stringInput = viewModel =>
    input({
        "type": "text",
        "name": viewModel.prop.path,
        "pattern": viewModel.prop.pattern,
        "value": viewModel.value
    });

export const labelledStringInput = viewModel =>
    label("property", viewModel.label, stringInput(viewModel));

export const submit = (className, ...content) =>
    `<button${maybeClass(className)}>${content.join(" ")}</button>`;
