import { publish, subscribe } from "../bus.js";
import config from "../config.js";

const signInStates = {};

subscribe(config.bus.SIGNED_IN, (_, x) => {
    signInStates[x.provider] = x;
});

function handleLoginViewClick(e) {
    if (e.target.classList.contains("gapi"))
        handleGAPIButtonClick(e);
}

function handleGAPIButtonClick(e) {
    const signInState = signInStates["GAPI"];
    if (!signInState) return;
    publish(signInState.isSignedIn
        ? config.bus.GAPI.REQUEST_SIGN_OUT
        : config.bus.GAPI.REQUEST_SIGN_IN
    );
}

window.customElements.define("login-controls", class LoginControls extends HTMLElement {

    #view;

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this.#view) {
            const view = document.createElement("login-view");
            view.addEventListener("click", handleLoginViewClick);
            this.appendChild(view);
            this.#view = view;
        }
        this.#view.props = { ...signInStates };
    }

});