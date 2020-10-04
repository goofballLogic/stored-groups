export default item => `

    <a class="item" href="?relativePath=${encodeURIComponent(item.relativePath)}">${item.name}</a>

`;
