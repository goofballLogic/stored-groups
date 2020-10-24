import config from "./config.js";
import { publish } from "./bus.js";
// global logging support
import "./log.js";
// views
import "./views/index.js";
// GAPI support
import { load } from "./gapi/gapi.js";
/* window-based GAPI stuff */
let safety = 40;
function waitForGAPI() {
    if (safety-- < 1) {
        publish(config.bus.ERROR, "Timeout waiting for GAPI to load");
        return;
    }
    const script = document.querySelector("#gapi-script");
    if (script && script.dataset.loaded && window.gapi)
        load(window.gapi);
    else {
        console.log("Waiting for GAPI", safety);
        setTimeout(waitForGAPI, 100);
    }
}

window.addEventListener("DOMContentLoaded", waitForGAPI);