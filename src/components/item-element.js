import Item from "../catalog/Item.js";
import { pickView } from "../views/view-registry.js";

customElements.define("item-element", class extends HTMLElement {

    connectedCallback() {
        this.render();
    }

    async render() {
        this.classList.add("loading");
        this.innerHTML = "";
        try {
            const searchParams = new URLSearchParams(location.search);
            const relativePath = searchParams.get("relativePath");
            const item = new Item({ relativePath });
            this.innerHTML = "";
            this.classList.add("loading");
            await item.load();
            const viewName = pickView(item);
            const view = document.createElement(viewName);
            this.appendChild(this.renderRefreshButton(item));
            this.appendChild(view);
            view.props = item;
        } catch (err) {
            console.error(err);
            this.textContent = err.toString();
        } finally {
            this.classList.remove("loading");
        }
    }

    renderRefreshButton(item) {
        const button = document.createElement("BUTTON");
        button.textContent = "Refresh";
        button.addEventListener("click", e => {
            e.preventDefault();
            item.invalidate();
            this.render();
        });
        return button;
    }
});