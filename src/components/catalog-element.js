import Catalog from "../catalog/Catalog.js";
import catalogLinkTemplate from "./catalog-link-template.js";
import itemLinkTemplate from "./item-link-template.js";
import { defineElement } from "./register.js"

class CatalogElement extends HTMLElement {
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
        const article = this.#output;
        try {
            const items = await catalog.items();
            const catalogNav = document.createElement("NAV");
            const itemNav = document.createElement("NAV");
            catalogNav.classList.add("catalog");
            itemNav.classList.add("item");
            for (var item of items) {
                if (item instanceof Catalog)
                    catalogNav.innerHTML += catalogLinkTemplate(item);
                else
                    itemNav.innerHTML += itemLinkTemplate(item);
            }
            article.innerHTML = "";
            article.classList.remove("loading");
            article.appendChild(catalogNav);
            article.appendChild(itemNav);

        } catch (err) {
            article.classList.remove("loading");
            console.error(err);
            article.textContent = err.toString();
        }
    }

    render() {
        const article = this.#output = this.#output || document.createElement("ARTICLE");
        if (article.parentElement !== this) {
            this.appendChild(article);
        }
        article.classList.add("loading");
        article.innerHTML = "";
        this.refresh();
    }
}

defineElement("catalog-element", CatalogElement);
