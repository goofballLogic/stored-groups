import { publish, subscribe } from "../bus.js";
import config from "../config.js";

subscribe(config.bus.SIGNED_IN, handleSignedIn);
subscribe(config.bus.STORAGE.LIST_OBJECTS, handleListObjects);

const folderMimeType = "application/vnd.google-apps.folder";

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

const rootFolderQuery = query({ name: config.drive.ROOT, ofType: folderMimeType });

async function findRootFolder() {
    const drive = gapi_config.gapi.client.drive;
    const listResponse = await drive.files.list({ q: rootFolderQuery });
    return listResponse.result.files.find(({ name }) => name === config.drive.ROOT);
}

async function findFile(folder, name, mimeType) {
    const drive = gapi_config.gapi.client.drive;
    const q = query({ name, ofType: mimeType, parent: folder.id });
    const fields = "files(id, name, modifiedTime)";
    const listResponse = await drive.files.list({ q, fields });
    const found = listResponse.result.files.filter(({ name }) => name === name);
    console.log(found);
    if (found.length === 1) return found[0];
    if (found.length === 0) return null;
    const sorted = found.sort((a, b) => a.modifiedTime > b.modifiedTime);
    const file = sorted[0];
    console.log("Deleting", file);
    await drive.files.delete({ fileId: file.id });
    return findFile(folder, name, mimeType);
}

async function createRootFolder() {
    const drive = gapi_config.gapi.client.drive;
    await drive.files.create({
        name: config.drive.ROOT,
        mimeType: folderMimeType
    });
    return await findRootFolder();
}

async function createFile(folder, name, mimeType) {
    const drive = gapi_config.gapi.client.drive;
    await drive.files.create({ name, mimeType, parents: [folder.id] });
    return await findFile(folder, name, mimeType);
}

async function findOrCreateFile(folder, name, mimeType) {
    return (await findFile(folder, name, mimeType)) || (await createFile(folder, name, mimeType));
}

export async function identifyFile(name, mimeType) {
    if (!gapi) throw new Error("GAPI not initialized");
    const folder = await findOrCreateRootFolder();
    const found = await findOrCreateFile(folder, name, mimeType);
    if (!found) throw new Error(`Failed to find or create ${folder} / ${name} (${mimeType})`);
    return found.id;
}

export async function findOrCreateRootFolder() {
    if (!gapi) throw new Error("GAPI not initialized");
    return (await findRootFolder()) || (await createRootFolder());
}

function handleGetRoot(topic, { callback }) {

    if (!config) return;
    const { gapi } = gapi_config;
    const drive = gapi.client.drive;

    publish(config.bus.DEBUG, `Handling ${topic} from ${this}`);

    (async function () {
        try {
            const rootFolder = await findOrCreateRootFolder();
            if (!rootFolder) throw new Error("Failed to find or create root folder");
            handleRootFolderFound(rootFolder);
        } catch (err) {
            callback ? callback(err) : publish(config.bus.ERROR, err);
        }
    }());

    async function handleRootFolderFound({ id }) {

        publish(config.bus.DEBUG, `Root folder id: ${id}`);
        const q = query({ name: "index.json", notOfType: folderMimeType, parent: id });
        const ret = await drive.files.list({ q });
        throw new Error("Not implemented");
    }

}