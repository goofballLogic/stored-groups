let window = {};
importScripts("./lib/jsonld.min.js");
const jsonld = window.jsonld;
delete window;

jsonld.documentLoader = async (url) => {
    if(url.startsWith("http://dev.openteamspace.com/vocab/context.jsonld")) {
        url = "/data/context.jsonld";
    }
    const res = await readThrough(new Request(url));
    return {
        contextUrl: null,
        document: await res.json(),
        documentUrl: url
    };
};

const version = "0.4.0";
const log = (...args) => console.log("[ServiceWorker]", version, ...args);
const context_path = "/data/context.jsonld";
const edits_db = "edits";

self.addEventListener("install", event => {

    log("Install");
    event.waitUntil(self.skipWaiting());

});

self.addEventListener("activate", event => {

    log("Activate");
    self.clients.matchAll({ includeUncontrolled: true }).then(clientList => {

        const urls = clientList.map(x => x.url);
        log("Matching clients:", urls.join(", "));

    });

    log("Claiming clients");
    event.waitUntil(self.clients.claim());

});

self.addEventListener("fetch", event => {

    const url = new URL(event.request.url);
    if (url.pathname.endsWith(".jsonld"))
        event.respondWith(handleFetchJSONLD(event));
    if (url.pathname.endsWith("/edits"))
        event.respondWith(handleEdits(event));

});

async function handleFetchJSONLD(event) {

    switch (event.request.method) {
        case "GET":
            return readThrough(event.request);
        default:
            break;
    }

};

async function handleEdits(event) {

    const ct = event.request.headers.get("content-type");
    switch (ct) {
        case "application/x-www-form-urlencoded":
            return await handleEditsFormData(event);
        default:
            throw new Error("Unhandled content type for edits: " + ct);
            break;
    }

}

async function handleEditsFormData(event) {

    const formData = await event.request.formData();
    const id = formData.get("@id");
    if (!id) throw new Error("No object id found");

    const parsed = Array.from(formData.entries());
    await cacheWrite(edits_db, id, parsed);

    const referrer = event.request.referrer;
    const url = new URL(referrer);
    url.searchParams.set("save", Date.now());
    return Response.redirect(url.toString(), 302);

}

const CACHE = "json_cache";

async function readThrough(req) {

    const cache = await caches.open(CACHE);
    const matched = await cache.match(req);
    if (matched) {

        return await decorateJsonResponse(req, matched.clone());

    } else {

        log("from server", req.url);
        const resp = await fetch(req);
        if(resp.ok) {

            log("caching", req.url);
            const clone = resp.clone();
            await cache.put(req, resp);
            log("cached", req.url);
            return await decorateJsonResponse(req, clone);

        } else {

            return resp;

        }

    }

}

async function decorateJsonResponse(req, res) {
    const url = new URL(req.url);

    if (/\/teams\/.*\.jsonld$/.test(url.pathname)) {
        try {
            return await decorateTeamsResponse(req, res);
        } catch(err) {
            console.error(err);
            return res;
        }
    } else {
        return res;
    }
}

function findObjectById(doc, key) {
    return doc.find(x => x["@id"] === key);
}

async function decorateTeamsResponse(req, res) {

    const working = res.clone()
    const baseHeaders = working.headers;
    const baseData = await working.json();
    const expanded = await jsonld.expand(baseData);
    const db = await openCacheDatabase(edits_db);
    const keys = await readObjectStore(db, edits_db, store => store.getAllKeys());
    while(keys.length > 0) {
        const key = keys.shift();
        const object = findObjectById(expanded, key);
        if(object) {
            const edit = await readObjectStore(db, edits_db, store => store.get(key));
            if(edit && edit.data) {
                for(const prop of edit.data) {
                    object[prop[0]] = prop[1];
                }
            }
        }
    }
    const contextURL = new URL(req.url);
    contextURL.pathname = context_path;
    const compacted = await jsonld.compact(expanded, { "@context": contextURL.toString() });
    const originalContentType = baseHeaders.get("content-type");
    const patchedBody = new Blob([JSON.stringify(compacted)], { type: originalContentType });
    const patchedHeaders = new Headers();
    for(let header of baseHeaders.entries()) {
        patchedHeaders.set(header[0], header[1]);
    }
    return new Response(patchedBody, {
        headers: patchedHeaders
    });
}

async function cacheWrite(category, key, data) {

    const db = await openCacheDatabase(category);
    await writeObjectStore(db, category, store => store.put({ key, data }));

}

async function readObjectStore(db, storeName, query) {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction([storeName], "readonly");
        const objectStore = transaction.objectStore(storeName);
        const request = query(objectStore);
        request.onerror = reject;
        request.onsuccess = e => resolve(e.target.result);

    });

}

async function writeObjectStore(db, storeName, command) {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const request = command(objectStore);
        request.onerror = reject;
        request.onsuccess = e => resolve(e.target.result);

    });

}

const idbVersion = 1;

async function openCacheDatabase(category) {

    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(CACHE, idbVersion);
        openRequest.onerror = reject;
        openRequest.onupgradeneeded = oune => {
            const db = oune.target.result;
            db.createObjectStore(category, { keyPath: "key" });
            console.log("Created object store", category, "in", CACHE, "(version", idbVersion, ")");
        };
        openRequest.onsuccess = ose => resolve(ose.target.result);
    });

}