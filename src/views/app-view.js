import { loadStylesheet } from "./stylesheets.js";

customElements.define('app-view', class extends HTMLElement {
    #props;

    constructor() {
        super();
        loadStylesheet("app-view");
    }

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        const { signInState } = this.#props;
        this.innerHTML = "";
        this.appendChild(document.createElement("login-controls"));
        this.appendChild(this.renderNav());
        if (signInState && signInState.isSignedIn) {
            this.appendChild(this.renderSignedIn());
        }
    }

    renderNav() {
        const nav = document.createElement("NAV");
        nav.appendChild(this.renderHomeLink());
        return nav;
    }

    renderHomeLink() {
        const a = document.createElement("A");
        a.href = location.href.substring(0, location.href.indexOf("?"));
        a.className = "catalog";
        a.textContent = "Home";
        return a;
    }

    renderSignedIn() {
        const { urlState } = this.#props;
        const tagName = urlState.isCatalog ? "catalog-element" : "item-element";
        return document.createElement(tagName);
    }
});