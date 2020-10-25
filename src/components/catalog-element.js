import Catalog from "../catalog/Catalog.js";

const buildItemLink = item => `?relativePath=${encodeURIComponent(item.relativePath)}`;

const buildCatalogLink = catalog => `${buildItemLink(catalog)}&type=catalog`;

customElements.define("catalog-element", class extends HTMLElement {

    connectedCallback() {
        this.render();
    }

    async render() {
        this.classList.add("loading");
        this.innerHTML = "";
        try {
            const searchParams = new URLSearchParams(location.search);
            const relativePath = searchParams.get("relativePath") || "";
            const catalog = new Catalog({ relativePath });
            await catalog.load();
            const items = await catalog.items();
            const childCatalogs = items
                .filter(item => item instanceof Catalog)
                .map(item => ({ item, href: buildCatalogLink(item) }));
            const childItems = items
                .filter(item => !(item instanceof Catalog))
                .map(item => ({ item, href: buildItemLink(item) }));
            const view = document.createElement("catalog-view");
            view.props = { catalogs: childCatalogs, items: childItems };
            this.innerHTML = "";
            this.appendChild(view);
        } catch (err) {
            console.error(err);
            this.textContent = err.toString();
        } finally {
            this.classList.remove("loading");
        }
    }
});
