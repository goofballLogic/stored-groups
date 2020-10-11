import placeholder from "./item-icon-default.js";

export default item => `

    <img src="${item.icon || placeholder}" />
    <h3>${item.name}</h3>
    ${item.props.map(prop => `

    <div>${prop.label}: ${prop.value || ""}</div>

    `).join("\n")}

`;
