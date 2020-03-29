const baseURL = Symbol("base url");
const tenantId = Symbol("tenant id");
const context = Symbol("context document");
const shapes = Symbol("shapes");

export default class DevStorageAgent {

    constructor({ url, tenant }) {
        this[baseURL] = Object.assign(new URL(url), {
            search: "",
            pathname: "/data",
            hash: ""
        });
        this[tenantId] = tenant;
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
    }

    async loadJSON(relativePath) {
        const url = new URL(this[baseURL]);
        url.pathname += relativePath;
        const res = await fetch(url);
        if(!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
        return await res.json();
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

    relativeId(fullyQualifiedId) {
        if(!fullyQualifiedId) return fullyQualifiedId;
        const parsed = new URL(fullyQualifiedId);
        const tenantPrefix = `/ots/${this[tenantId]}`;
        return parsed.pathname.startsWith(tenantPrefix)
            ? parsed.pathname.substring(tenantPrefix.length)
            : fullyQualifiedId;
    }
}