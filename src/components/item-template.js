import placeholder from "./item-icon-default.js";

const property = prop => `

    <div>${prop.label}: ${prop.value || ""}</div>

`;

export default item => `

    <img src="${item.icon || placeholder}" />
    <h3>${item.name}</h3>
    ${item.props.map(property).join("\n")}

`;
