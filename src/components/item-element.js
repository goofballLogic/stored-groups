import Item from "../catalog/Item.js";
import itemTemplate from "./item-template.js";
import { defineElement } from "./register.js"

class ItemElement extends HTMLElement {
    #output

    constructor() {
        super();
        this.render();
    }

    async refresh() {
        const searchParams = new URLSearchParams(location.search);
        const relativePath = searchParams.get("relativePath");
        const item = new Item({ relativePath });
        const article = this.#output;
        try {
            article.innerHTML = "";
            article.classList.add("loading");
            await item.load();
            article.innerHTML = itemTemplate(item);
        } catch (err) {
            console.error(err);
            article.textContent = err.toString();
        } finally {
            article.classList.remove("loading");
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

defineElement("item-element", ItemElement);
