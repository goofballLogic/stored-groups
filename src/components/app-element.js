import "./login-controls.js";
import "./catalog-element.js";
import "./item-element.js";

import { subscribe } from "../bus.js";
import config from "../config.js";

let urlState = { isCatalog: false };

function observeUrl() {
    const searchParams = new URLSearchParams(location.search);
    urlState.isCatalog = searchParams.get("type") === "catalog" || !searchParams.get("relativePath");
}

/*
    it's important that this listener is registered ahead of the ones in the
    constructor below
*/
window.addEventListener("popstate", observeUrl);

const linkCatcher = element => element.tagName === "A" && element.classList.contains("catalog");

function findUp(element, test) {
    return !element
        ? false
        : test(element)
            ? element
            : findUp(element.parentElement, test);
}

customElements.define("app-element", class extends HTMLElement {

    #signInState;

    constructor() {
        super();
        observeUrl();
        this.#signInState = { signedIn: false };
        subscribe(config.bus.SIGNED_IN, (_, payload) => {
            this.#signInState = payload;
            this.render();
        });
        window.addEventListener("popstate", () => this.render());
        this.addEventListener("click", this.handleClick, { capture: true });
        this.render();
    }

    handleClick(e) {
        const foundLink = findUp(e.target, linkCatcher);
        if (foundLink) {
            e.preventDefault();
            history.pushState(null, null, foundLink.href);
            observeUrl();
            this.render();
        }
    }

    render() {

        this.innerHTML = "";
        const appView = document.createElement("app-view");
        appView.props = { signInState: this.#signInState, urlState };
        this.appendChild(appView);

    }

});