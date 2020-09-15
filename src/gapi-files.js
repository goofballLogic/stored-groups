import { publish, subscribe } from "./bus.js";
import config from "./config.js";

subscribe(config.bus.SIGNED_IN, handleSignedIn);
subscribe(config.bus.STORAGE.LIST_OBJECTS, handleListObjects);

let gapi_config = null;

function handleSignedIn(_, { provider, gapi, key, isSignedIn }) {
    gapi_config = (provider !== "GAPI" || (!isSignedIn))
        ? null
        : { gapi, key };
}

function handleListObjects(_, callback) {
    if (!config) return;
    const { gapi } = gapi_config;
    const drive = gapi.client.drive;
    const folderMimeType = "application/vnd.google-apps.folder";
    const dataMimeType = "application/json";

    const q = `trashed=false and mimeType='${folderMimeType}'`;
    drive.files.list({ q }).then(handleFilesListSuccess, handleFailure);

    function handleFilesListSuccess({ result }) {
        const found = result.files.find(({ name }) => name === config.drive.ROOT);
        if (found)
            handleRootFolderFound({ result: found });
        else {
            const opts = {
                name: config.drive.ROOT,
                mimeType: folderMimeType
            };
            drive.files.create(opts).then(handleRootFolderFound, handleFailure);
        }
    }

    function handleRootFolderFound({ result: { id } }) {
        if (!id) { handleFailure(new Error(`Failed to find or create root folder: ${config.drive.ROOT}`)) };
        const q = `trashed = false and mimeType != '${folderMimeType}' and name = 'index.json' and '${id}' in parents`;
        console.log(q);
        drive.files.list({ q }).then(handleFilesListRootIndexSuccess, handleFailure);
    }

    function handleFilesListRootIndexSuccess({ result }) {
        const found = result.files.find(({ name }) => name === "index.json");
        if (found)
            handleRootFolderIndexFound({ result: found });
        else {
            callback([]);
        }
    }

    function handleRootFolderIndexFound({ result }) {
        console.log("Index", result);
    }
    function handleFailure(err) {
        publish(config.bus.ERROR, err);
    }
}