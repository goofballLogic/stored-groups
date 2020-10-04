export default catalog => `

    <a class="catalog" href="?relativePath=${encodeURIComponent(catalog.relativePath)}">${catalog.name}</a>

`;
