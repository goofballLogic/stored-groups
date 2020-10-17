import placeholder from "./item-icon-default.js";

const defaultRenderer = Symbol();

const renderers = {
    "string": prop => `
        <div>${prop.label}: ${prop.value || ""}</div>
    `,
    [defaultRenderer]: prop => `
        <div>${prop.label}: ${prop.value} (unhandled type ${prop.dataType})</div>
    `,
};

const property = prop => (renderers[prop.dataType] || renderers[defaultRenderer])(prop);

export default item => `

    <img src="${item.icon || placeholder}" />
    <h3>${item.name}</h3>
    ${item.props.map(property).join("\n")}

`;
