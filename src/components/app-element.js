import "./login-controls.js";
import "./catalog-element.js";
import "./item-element.js";

import { subscribe } from "../bus.js";
import appTemplate from "./app-template.js";
import config from "../config.js";

let urlState = { isCatalog: false };

function observeUrl() {
    console.log("observe Url", urlState);
    const searchParams = new URLSearchParams(location.search);
    urlState.isCatalog = searchParams.get("type") === "catalog" || !searchParams.get("relativePath");
}

/*
    it's important that this listener is registered ahead of the ones in the
    constructor below
*/
window.addEventListener("popstate", observeUrl);

const handledNavClasses = ["item", "catalog"];

class AppElement extends HTMLElement {

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
        console.log(e.target.tagName);
        e.preventDefault();
        if (e.target && e.target.tagName === "A" && handledNavClasses.some(c => e.target.classList.contains(c))) {
            e.preventDefault();
            history.pushState(null, null, e.target.href);
            observeUrl();
            this.render();
        } else {
            e.preventDefault();
            debugger;
        }
    }

    render() {

        this.innerHTML = appTemplate(this.#signInState, urlState);

    }
}
window.customElements.define("app-element", AppElement);