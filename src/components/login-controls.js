import { publish, subscribe } from "../bus.js";
import config from "../config.js";

const signInStates = {};

subscribe(config.bus.SIGNED_IN, (_, x) => {
    signInStates[x.provider] = x;
});

class LoginControls extends HTMLElement {

    #gapiButton;

    constructor() {
        super();
        this.render();
    }

    render() {
        if (signInStates["GAPI"]) this.renderGAPI(signInStates["GAPI"]);
    }

    renderGAPI(state) {
        if (!this.#gapiButton) {
            this.#gapiButton = document.createElement("BUTTON");
            this.#gapiButton.addEventListener("click", this.handleGAPIButtonClick);
        }
        const gapiButton = this.#gapiButton;
        gapiButton.textContent = state.isSignedIn ? "Sign-out (Google)" : "Sign-in (Google)";
        if (gapiButton.parentElement != this) this.appendChild(gapiButton);
    }

    handleGAPIButtonClick(e) {
        const signInState = signInStates["GAPI"];
        if (!signInState) return;
        publish(signInState.isSignedIn
            ? config.bus.GAPI.REQUEST_SIGN_OUT
            : config.bus.GAPI.REQUEST_SIGN_IN
        );
    }
}
window.customElements.define("login-controls", LoginControls);