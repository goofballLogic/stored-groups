import Catalog from "../catalog/Catalog.js";
import { buildItemLink, buildCatalogLink } from "../nav.js";

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
            this.appendChild(this.renderRefreshButton(catalog));
            this.appendChild(view);
        } catch (err) {
            console.error(err);
            this.textContent = err.toString();
        } finally {
            this.classList.remove("loading");
        }
    }

    renderRefreshButton(catalog) {
        const button = document.createElement("BUTTON");
        button.textContent = "Refresh";
        button.addEventListener("click", e => {
            e.preventDefault();
            catalog.invalidate();
            this.render();
        });
        return button;
    }
});
