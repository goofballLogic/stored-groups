import { publish, subscribe } from "../bus.js";
import config from "../config.js";
import { tenantUrlRoot } from "../path.js";

subscribe(config.bus.SIGNED_IN, handleSignedIn);
subscribe(config.bus.STORAGE.LIST_OBJECTS, handleListObjects);
subscribe(config.bus.STORAGE.FETCH_OBJECT, handleFetchObject);

const folderMimeType = "application/vnd.google-apps.folder";

let gapi_config = null;

function handleSignedIn(_, { provider, gapi, tenant, isSignedIn }) {
    gapi_config = (provider !== "GAPI" || (!isSignedIn))
        ? null
        : { gapi, tenant };
}

function catalogForPath(path) {
    let ret = "_index.json";
    if (path) {
        ret = `${(path.endsWith("/") ? path : `${path}/`)}${ret}`;
        ret = ret.startsWith("/") ? ret.substr(1) : ret;
    }
    return ret;
}

function itemForPath(path) {
    if (!path) throw new Error("Invalid item name");
    return path + ".json";
}

const sharedContext = {
    "@context": {
        "@vocab": "https://app.openteamspace.com/vocab#",
        "ots": "https://app.openteamspace.com/vocab#"
    }
};

async function handleFetchObject(message, { path, callback }) {
    if (!gapi_config) return;
    publish(config.bus.DEBUG, `Handling ${message} for GAPI`);
    try {
        const itemFileName = itemForPath(path);
        const content = await downloadJSONFromRoot(itemFileName);
        const data = await jsonld.expand(content);
        const query = LD(data, sharedContext["@context"]);
        callback(null, { query });
    } catch (err) {
        console.warn(err);
        callback(err);
    }
}

async function handleListObjects(message, { path, callback }) {
    if (!gapi_config) return;
    publish(config.bus.DEBUG, `Handling ${message} for GAPI`);
    try {
        const catalogFileName = catalogForPath(path);
        const content = await downloadJSONFromRoot(catalogFileName);
        const idroot = await tenantUrlRoot(gapi_config.tenant);
        const context = JSON.parse(JSON.stringify(sharedContext));
        context["@context"]["@base"] = idroot;
        const flat = await jsonld.flatten(content, context);
        const items = flat["@graph"];
        callback(null, { items });
    } catch (err) {
        console.warn(err);
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

window.downloadJSONFromRoot = downloadJSONFromRoot;

async function downloadJSONFromRoot(fileName) {
    const folder = await findOrCreateRootFolder();
    const item = await findFile(folder, fileName, "application/json");
    if (!item) {
        console.warn("Item not found", fileName);
        return null;
    }
    return await downloadFile(item);
}

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