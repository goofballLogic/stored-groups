import { publish, subscribe } from "../bus.js";
import config from "../config.js";
import contextFetcher from "../context.js";

import saveJSON from "./save-json.js";

contextFetcher().then(console.log.bind(console));

subscribe(config.bus.SIGNED_IN, handleSignedIn);
subscribe(config.bus.STORAGE.SAVE, handleSave);

let gapi_config = null;

function handleSignedIn(_, { provider, gapi, tenant, isSignedIn }) {
    gapi_config = (provider !== "GAPI" || (!isSignedIn))
        ? null
        : { gapi, tenant };
}

const here = () => Error().stack.split("\n")[2].trim();

async function gapiRelativePath(url) {
    const context = await contextFetcher();
    const urlRoot = context["@base"];
    const tenantRoot = `${urlRoot}${gapi_config.tenant.id}/`;
    if (!url.startsWith(tenantRoot))
        throw new Error(`Path must start with ${tenantRoot}`);
    return url.substr(tenantRoot.length);
}

async function handleSave(topic, payload) {

    if (!payload) return;
    const { path, content, callback } = payload;
    try {
        if (!path) throw new Error("No path specified");
        publish(config.bus.DEBUG, `Handling ${topic} ${path} from ${here()}`);
        const localPath = await gapiRelativePath(path);
        console.log("Save", content, "to", localPath);
    } catch (err) {
        if (callback)
            callback(err);
        else
            publish(config.bus.ERROR, err);
    }

}