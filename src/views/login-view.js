import { loadStylesheet } from "./stylesheets.js";

customElements.define('login-view', class extends HTMLElement {
    #props;
    #gapiButton;

    constructor() {
        super();
        loadStylesheet("login-view");
    }

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        if (this.#props.GAPI) {
            let gapiButton = this.#gapiButton;
            if (!gapiButton) {
                gapiButton = document.createElement("BUTTON");
                gapiButton.classList.add("gapi");
                this.#gapiButton = gapiButton;
            }
            gapiButton.textContent = this.#props.GAPI?.isSignedIn ? "Sign-out (Google)" : "Sign-in (Google)";
            if (gapiButton.parentElement !== this) this.appendChild(gapiButton);
        }
    }
});