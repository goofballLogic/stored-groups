import { required } from "./lib/validation.js";
import { LD, jsonld } from "../lib/extern.js";

const baseURL = Symbol("base url");
const tenantId = Symbol("tenant id");
const context = Symbol("context document");
const shapes = Symbol("shapes");

function patchData(node, keyPath, data) {
    keyPath = keyPath.split(" ");
    while(keyPath.length > 1) {
        const step = keyPath.shift();
        if(!node[step]) {
            node[step] = [];
        }
        node = node[step];
        if(!Array.isArray(node)) throw new Error(`Expected ${step} to be an array in ${JSON.stringify(node)}`);
        if(node.length < 1) {
            node.push({});
        }
        node = node[0];
    }
    node[keyPath[0]] = data;
}

function deepUpdate(node, key, data) {
    if(!node) return;
    if(Array.isArray(node)) {
        node.forEach(x => deepUpdate(x, key, data));
    } else if (typeof node === "object") {
        if(node["@id"] === key) {
            console.log("Patching", key);
            data.forEach(([patchKey, patchValue]) => {
                if(patchKey !== "@id") {
                    console.log(patchKey, patchValue);
                    patchData(node, patchKey, patchValue);
                }
            });
        } else {
            Object.values(node).forEach(x => deepUpdate(x, key, data));
        }
    }
}

export default class DevStorageAgent {

    constructor({ url, tenant }) {
        this[baseURL] = Object.assign(new URL(url), {
            search: "",
            pathname: "/data",
            hash: ""
        });
        this[tenantId] = tenant;
    }

    installSubmitHandler() {
        document.addEventListener("submit", e => {
            if(e.target.method === "get") return;
            e.preventDefault();
            const data = new FormData(e.target);
            const id = required(data.get("@id"), "@id", "The id of the document being submitted");
            localStorage.setItem(id, JSON.stringify(Array.from(data.entries())));
            console.log("Saved", id);
            const url = new URL(location.href);
            url.searchParams.set("save", Date.now());
            location.href = url.toString();
        });
        console.log("Installed submit handler");
    }

    patchDocumentLoader(lib) {
        const originalLoader = lib.documentLoader.bind(lib);
        lib.documentLoader = async (documentUrl) => {
            if(documentUrl.startsWith("http://dev.openteamspace.com/vocab/context.jsonld")) {
                const document = await this.loadContext();
                return {
                    contextUrl: null,
                    document,
                    documentUrl
                };
            }
            return originalLoader(documentUrl);
        };
        console.log("Patched document loader");
    }

    async loadJSON(relativePath) {
        const url = new URL(this[baseURL]);
        url.pathname += relativePath;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
        const json = await res.json();
        if (relativePath.endsWith("/context.jsonld")) return json;
        const expanded = await jsonld.expand(json);
        const stored = Object.entries(localStorage);
        stored.forEach(([key, data]) => {
            deepUpdate(expanded, key, JSON.parse(data));
        });
        return expanded;
    }

    async loadContext() {
        if(!this[context]) this[context] = this.loadJSON("/context.jsonld");
        return await this[context];
    }

    async loadShapes() {
        if(!this[shapes]) this[shapes] = this.loadJSON(`/${this[tenantId]}/schema.jsonld`);
        return await this[shapes];
    }

    async browseRoot() {
        return await this.loadJSON(`/${this[tenantId]}/index.jsonld`);
    }

    async browseRelative(relativeId) {
        return await this.loadJSON(`/${this[tenantId]}${relativeId}/index.jsonld`);
    }

    editsURLForRelative(relativeId) {
        const url = new URL(this[baseURL]);
        url.pathname += `/${this[tenantId]}${relativeId}/edits`;
        return url.toString();
    }

    editsURLForRoot() {
        const url = new URL(this[baseURL]);
        url.pathname += `/${this[tenantId]}/edits`;
        return url.toString();
    }

    relativeId(fullyQualifiedId) {
        if(!fullyQualifiedId) return fullyQualifiedId;
        const parsed = new URL(fullyQualifiedId);
        const tenantPrefix = `/ots/${this[tenantId]}`;
        return parsed.pathname.startsWith(tenantPrefix)
            ? parsed.pathname.substring(tenantPrefix.length)
            : fullyQualifiedId;
    }
}