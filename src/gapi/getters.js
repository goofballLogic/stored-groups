import { publish, subscribe } from "../bus.js";
import config from "../config.js";

subscribe(config.bus.SIGNED_IN, handleSignedIn);
subscribe(config.bus.STORAGE.GET_ROOT, handleGetRoot);

let gapi_config = null;

function handleSignedIn(_, { provider, gapi, key, isSignedIn }) {
    gapi_config = (provider !== "GAPI" || (!isSignedIn))
        ? null
        : { gapi, key };
}

const query = ({ name, ofType, notOfType, parent }) => [
    `name='${name}'`,
    ofType && `mimeType='${ofType}'`,
    notOfType && `mimeType!='${notOfType}'`,
    parent && `'${parent}' in parents`,
    "trashed=false"
].filter(x => x).join(" and ");

function handleGetRoot(topic, { callback }) {

    if (!config) return;
    const { gapi } = gapi_config;
    const drive = gapi.client.drive;
    const folderMimeType = "application/vnd.google-apps.folder";

    publish(config.bus.DEBUG, `Handling ${topic} from ${this}`);

    (async function () {
        const q = query({ name: config.drive.ROOT, ofType: folderMimeType });
        try {
            const ret = await drive.files.list({ q });
            handleFilesListSuccess(ret);
        } catch (err) {
            handleFailure(err);
        }
    }());

    async function handleFilesListSuccess({ result }) {
        const found = result.files.find(({ name }) => name === config.drive.ROOT);
        if (found)
            handleRootFolderFound({ result: found });
        else {
            const opts = {
                name: config.drive.ROOT,
                mimeType: folderMimeType
            };
            try {
                const ret = await drive.files.create(opts);
                handleRootFolderFound(ret);
            } catch (err) {
                handleFailure(err);
            }
        }
    }

    async function handleRootFolderFound({ result: { id } }) {

        if (!id) { handleFailure(new Error(`Failed to find or create root folder: ${config.drive.ROOT}`)) };
        publish(config.bus.DEBUG, `Root folder id: ${id}`);
        const q = query({ name: "index.json", notOfType: folderMimeType, parent: id });
        try {
            const ret = await drive.files.list({ q });
            handleFilesListRootIndexSuccess(ret);
        } catch (err) {
            handleFailure(err);
        }
    }

    function handleFilesListRootIndexSuccess({ result }) {
        const found = result.files.find(({ name }) => name === "index.json");
        if (found)
            handleRootFolderIndexFound({ result: found });
        else {
            callback(null);
        }
    }

    function handleRootFolderIndexFound({ result }) {
        console.log("Index", result);
    }

    function handleFailure(err) {
        publish(config.bus.ERROR, err);
    }
}