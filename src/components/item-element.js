import Item from "../catalog/Item.js";
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
            article.innerHTML = item.toString();
            article.classList.remove("loading");

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

defineElement("item-element", ItemElement);
