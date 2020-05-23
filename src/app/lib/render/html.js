export const maybeClass = className => className ? ` class="${className}"` : "";

export const tag = tagName => (className, ...content) =>
    `<${tagName}${maybeClass(className)}>${content.join(" ")}</${tagName}>`;

export const span = tag("span");

export const div = tag("div");

export const li = tag("li");

export const ol = tag("ol");

export const ul = tag("ul");

export const pre = tag("pre");

export const a = (className, href, ...content) =>
    `<a${maybeClass(className)} href="${href}">${content.join(" ")}</a>`;

export const labelledDiv = (className, labelText, ...content) =>
    div(className, span("label", labelText), div("property-value", ...content));
