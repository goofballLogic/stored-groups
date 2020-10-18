import placeholder from "./item-icon-default.js";

const defaultRenderer = Symbol();

const renderers = {
    "string": prop => `
        <div>${prop.label}: ${prop.values[0] || ""}</div>
    `,
    [defaultRenderer]: prop => `
        <div>${prop.label}: ${prop.values} (unhandled type ${prop.dataType})</div>
    `,
};

const compound = prop => `
    <div>
        ${prop.label}<br />
        <ul>
            ${(prop.values || []).map(props => `
            <li>
                ${props.map(property).join("\n")}
            </li>
            `).join("\n")}
        </ul>
    </div>
`;

const property = prop =>
    (prop.compoundType
        ? compound(prop)
        : (renderers[prop.dataType] || renderers[defaultRenderer])(prop)
    );

export default item => `

    <img src = "${item.icon || placeholder}" />
    <h3>${item.name}</h3>
    ${item.viewModel.map(property).join("\n")}

`;
