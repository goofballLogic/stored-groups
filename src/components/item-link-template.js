import placeholder from "./item-icon-default.js";

export default item => `

    <a class="item" href="?relativePath=${encodeURIComponent(item.relativePath)}">
        <span><img src="${item.icon || placeholder}" /></span>
        <span>${item.name}</span>
    </a>

`;
