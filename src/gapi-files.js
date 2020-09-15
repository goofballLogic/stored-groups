import { publish, subscribe } from "./bus.js";
import config from "./config.js";

subscribe(config.bus.SIGNED_IN, handleSignedIn);
subscribe(config.bus.STORAGE.LIST_FOLDERS, handleListFolders);

let gapi_config = null;

function handleSignedIn(_, { provider, gapi, key, isSignedIn }) {
    gapi_config = (provider !== "GAPI" || (!isSignedIn))
        ? null
        : { gapi, key };
}

function handleListFolders(_, callback) {
    if (!config) return;
    const { gapi, key } = gapi_config;

    const opts = {
        q: "mimeType='application/vnd.google-apps.folder'"
    }
    gapi.client.drive.files.list(opts).then(handleFilesListSuccess, handleFilesListFailure);

    function handleFilesListSuccess({ result }) {
        callback(result.files.map(({ id, name }) => ({ id, name })));
    }

    function handleFilesListFailure(err) {
        publish(config.bus.ERROR, err);
    }
}