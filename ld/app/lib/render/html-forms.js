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

const maybeAttr = (attrName, maybeValue) => maybeValue ? `${attrName}="${maybeValue}"`: "";

const input = ({ type, name, pattern, step, value }) =>
    `<input type="${type}" name="${name}" value="${value}"${maybeAttr("pattern", pattern)}${maybeAttr("step", step)} />`;

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

const integerInput = viewModel =>
    input({
        "type": "number",
        "step": 1,
        "pattern": viewModel.prop.pattern,
        "value": viewModel.value
    });

export const labelledIntegerInput = viewModel =>
    label("property", viewModel.label, integerInput(viewModel));

export const labelledStringInput = viewModel =>
    label("property", viewModel.label, stringInput(viewModel));

export const submit = (className, ...content) =>
    `<button${maybeClass(className)}>${content.join(" ")}</button>`;

export const associatedRadioInput = ({ className, label: labelText, name, value }) =>
    label(className, labelText, input({ type: "radio", name, value }));