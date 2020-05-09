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

export const hiddenInput = ({ name, value }) =>
    input({
        "type": "hidden",
        name,
        value
    });

const stringInput = ({ name, pattern, value }) =>
    input({
        "type": "text",
        name,
        pattern,
        value
    });

const integerInput = ({ name, pattern, value }) =>
    input({
        "type": "number",
        "step": 1,
        name,
        pattern,
        value
    });

export const labelledIntegerInput = ({ label: labelText, name, pattern, value }) =>
    label("property", labelText, integerInput({ name, pattern, value }));

export const labelledStringInput = ({ label: labelText, name, pattern, value }) =>
    label("property", labelText, stringInput({ name, pattern, value }));

export const submit = (className, ...content) =>
    `<button${maybeClass(className)}>${content.join(" ")}</button>`;

export const associatedRadioInput = ({ className, label: labelText, name, value }) =>
    label(className, labelText, input({ type: "radio", name, value }));