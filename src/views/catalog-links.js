import placeholder from "./catalog-icon-default.js";
import { loadStylesheet } from "./stylesheets.js";

function renderCatalogLink({ item, href }) {
    const a = document.createElement("A");
    a.className = "catalog";
    a.href = href;
    a.appendChild(renderIcon(item));
    a.appendChild(renderName(item));
    return a;
}

function renderIcon(item) {
    const img = document.createElement("IMG");
    img.src = item.icon || placeholder;
    return img;
}

function renderName(item) {
    const span = document.createElement("SPAN");
    span.textContent = item.name;
    return span;
}

customElements.define("catalog-links", class extends HTMLElement {

    #props;

    constructor() {
        super();
        loadStylesheet("catalog-links");
    }

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        this.innerHTML = "";
        this.appendChild(this.renderNav());
    }

    renderNav() {
        const nav = document.createElement("NAV");
        this.#props.map(renderCatalogLink).forEach(x => nav.appendChild(x));
        return nav;
    }

});