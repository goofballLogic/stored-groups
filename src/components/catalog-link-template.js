export default catalog => `

    <a class="catalog" href="?relativePath=${encodeURIComponent(catalog.relativePath)}&type=catalog">${catalog.name}</a>

`;
