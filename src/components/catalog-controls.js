import Catalog from "../catalog/Catalog.js";
import catalogLinkTemplate from "./catalog-link-template.js";
import itemLinkTemplate from "./item-link-template.js";

class CatalogControls extends HTMLElement {
    #output

    constructor() {
        super();
        this.render();
    }

    async refresh() {
        const searchParams = new URLSearchParams(location.search);
        const relativePath = searchParams.get("relativePath");
        const spec = { relativePath };
        const catalog = new Catalog({ spec });
        try {
            const items = await catalog.items();
            const nav = document.createElement("NAV");
            for (var item of items) {
                if (item instanceof Catalog)
                    nav.innerHTML += catalogLinkTemplate(item);
                else
                    nav.innerHTML += itemLinkTemplate(item);
            }
            this.#output.innerHTML = "";
            this.#output.appendChild(nav);

        } catch (err) {
            console.error(err);
            this.#output.textContent = err.toString();
        }
    }

    static get observedAttributes() {
        return ["disabled"];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const article = this.#output = this.#output || document.createElement("ARTICLE");
        if (!this.hasAttribute("disabled")) {
            if (!article.parentElement)
                this.appendChild(article);
            article.textContent = "loading...";
            this.refresh();
        } else {
            if (article.parentElement)
                article.parentElement.removeChild(article);
        }
    }
}
window.customElements.define("catalog-controls", CatalogControls);