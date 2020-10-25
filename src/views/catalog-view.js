customElements.define("catalog-view", class extends HTMLElement {
    #props;

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        try {
            const { items, catalogs } = this.#props;
            const catalogLinks = document.createElement("catalog-links");
            catalogLinks.className = "catalog";
            catalogLinks.props = catalogs;
            const itemLinks = document.createElement("catalog-links");
            itemLinks.className = "item";
            itemLinks.props = items;
            this.appendChild(catalogLinks);
            this.appendChild(itemLinks);
        } catch (err) {
            this.innerHTML = err.stack;
        }
    }
});