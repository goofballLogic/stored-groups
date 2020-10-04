import "./login-controls.js";
import "./catalog-controls.js";
import { subscribe } from "../bus.js";
import appTemplate from "./app-template.js";
import config from "../config.js";

class AppElement extends HTMLElement {

    #signInState;

    constructor() {
        super();
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
        if (e.target.classList && e.target.classList.contains("catalog")) {
            e.preventDefault();
            history.pushState(null, null, e.target.href);
            this.render();
        }
    }

    render() {

        this.innerHTML = appTemplate(this.#signInState);

    }
}
window.customElements.define("app-element", AppElement);