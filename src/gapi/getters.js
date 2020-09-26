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

async function handleListObjects(message, { callback }) {
    if (!gapi_config) return;
    publish(config.bus.DEBUG, `Handling ${message} for GAPI`);
    try {
        const folder = await findOrCreateRootFolder();
        const catalog = await findFile(folder, "_index.json", "application/json");
        const content = await downloadFile(catalog);
        callback(null, content);
    } catch (err) {
        callback(err);
    }
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

async function downloadFile({ id: fileId }) {
    const drive = gapi_config.gapi.client.drive;
    const response = await drive.files.get({ fileId, alt: "media" });
    if (response.status === 200)
        return response.result;
    throw new Error(`Did not retrieve file ${response.status}`);
}

async function findFile(folder, name, mimeType) {
    const drive = gapi_config.gapi.client.drive;
    const q = query({ name, ofType: mimeType, parent: folder.id });
    const fields = "files(id, name, modifiedTime, webContentLink)";
    const listResponse = await drive.files.list({ q, fields });
    const found = listResponse.result.files.filter(({ name }) => name === name);
    if (found.length === 1) return found[0];
    if (found.length === 0) return null;
    const sorted = found.sort((a, b) => a.modifiedTime > b.modifiedTime);
    const file = sorted[0];
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