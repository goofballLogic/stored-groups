import placeholder from "./catalog-icon-default.js";

export default catalog => `

    <a class="catalog" href="?relativePath=${encodeURIComponent(catalog.relativePath)}&type=catalog">
        <span><img src="${catalog.icon || placeholder}" /></span>
        <span>${catalog.name}</span>
    </a>

`;
