import Catalog from "../catalog/Catalog.js";

class CatalogControls extends HTMLElement {
    #output

    constructor() {
        super();
        this.render();
    }

    async refresh() {
        const catalog = new Catalog();
        try {
            const items = await catalog.items();
            const ul = document.createElement("UL");
            for (var item of items) {
                console.log(item);
                const li = document.createElement("LI");
                li.textContent = `${item["name"]} (${item["@id"]}) is a ${item["@type"]}`;
                ul.appendChild(li);
            }
            this.#output.innerHTML = "";
            this.#output.appendChild(ul);
        } catch (err) {
            this.#output.textContent = err.toString();
        }
    }

    render() {
        const article = document.createElement("ARTICLE");
        this.appendChild(article);

        const h3 = document.createElement("H3");
        h3.innerText = "Catalog";
        article.appendChild(h3);

        const button = document.createElement("BUTTON");
        button.innerText = "Load";
        button.addEventListener("click", () => this.refresh());
        article.appendChild(button);

        const output = this.#output = document.createElement("PRE");
        output.textContent = "loading...";
        article.appendChild(output);

    }
}

window.customElements.define("catalog-controls", CatalogControls);