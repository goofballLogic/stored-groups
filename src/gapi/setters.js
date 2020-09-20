import { publish, subscribe } from "../bus.js";
import config from "../config.js";
import { gapiRelativePath } from "./path.js";

import saveJSON from "./save-json.js";

subscribe(config.bus.SIGNED_IN, handleSignedIn);
subscribe(config.bus.STORAGE.SAVE, handleSave);

let gapi_config = null;

function handleSignedIn(_, { provider, gapi, tenant, isSignedIn }) {
    gapi_config = (provider !== "GAPI" || (!isSignedIn))
        ? null
        : { gapi, tenant };
}

const here = () => Error().stack.split("\n")[2].trim();

async function handleSave(topic, payload) {

    if (!gapi_config) return;
    if (!payload) return;
    try {
        const { path, content, callback } = payload;
        if (!path) throw new Error("No path specified");
        publish(config.bus.DEBUG, `Handling ${topic} ${path} from ${here()}`);
        const localPath = await gapiRelativePath(path, gapi_config.tenant) + ".json";
        console.log("Save", content, "to", localPath);
        await saveJSON(gapi_config.gapi, localPath, content);
        callback && callback(null);
    } catch (err) {
        callback ? callback(err) : publish(config.bus.ERROR, err);
    }

}