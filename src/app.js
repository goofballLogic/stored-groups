import { subscribe } from "./bus.js";
import config from "./config.js";
import "./log.js";
import "./gapi/getters.js";
import "./gapi/setters.js";
import { load } from "./gapi/gapi.js";

subscribe(config.bus.SIGNED_IN, handleSignInChange);

function handleSignInChange(_, payload) {

    if (payload && payload.isSignedIn)
        spinUp();
    else
        spinDown();
}

function spinUp() {
    console.log("Hello world");
    document.querySelector("catalog-controls").removeAttribute("disabled");
}

function spinDown() {
    console.log("Goodbye");
    document.querySelector("catalog-controls").setAttribute("disabled", true);
}

let safety = 40;
function waitForGAPI(continuation) {
    if (safety-- < 1) {
        publish(config.bus.ERROR, "Timeout waiting for GAPI to load");
        return;
    }
    const script = document.querySelector("#gapi-script");
    if (script && script.dataset.loaded && window.gapi)
        continuation();
    else {
        console.log("Waiting for GAPI", safety);
        setTimeout(() => waitForGAPI(continuation), 100);
    }
}

window.addEventListener("DOMContentLoaded", () => {

    const controls = {
        signInButton: document.querySelector("#gapi-signin"),
        signOutButton: document.querySelector("#gapi-signout")
    };
    waitForGAPI(() => load(window.gapi, controls));

});