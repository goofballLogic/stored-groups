import Item from "../catalog/Item.js";

customElements.define("item-element", class extends HTMLElement {

    connectedCallback() {
        this.render();
    }

    async render() {
        this.classList.add("loading");
        this.innerHTML = "";
        const searchParams = new URLSearchParams(location.search);
        const relativePath = searchParams.get("relativePath");
        const item = new Item({ relativePath });
        try {
            this.innerHTML = "";
            this.classList.add("loading");
            await item.load();
            const view = document.createElement("item-view");
            this.appendChild(view);
            view.props = item;
        } catch (err) {
            console.error(err);
            this.textContent = err.toString();
        } finally {
            this.classList.remove("loading");
        }
    }
});