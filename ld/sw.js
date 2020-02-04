const version = "0.3.0";
const log = (...args) => console.log("[ServiceWorker]", version, ...args);

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
    if(url.pathname.endsWith(".jsonld"))
        event.respondWith(handleFetchJSONLD(event));
    if(url.pathname.endsWith("/edits"))
        event.respondWith(handleEdits(event));

});

async function handleFetchJSONLD(event) {

    switch(event.request.method) {
        case "GET":
            return readThrough(event);
        default:
            break;
    }

};

async function handleEdits(event) {

    const ct = event.request.headers.get("content-type");
    switch(ct) {
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
    if(!id) throw new Error("No object id found");

    const parsed = Array.from(formData.entries());
    await cacheWrite("edits", id, parsed);

    const referrer = event.request.referrer;
    const url = new URL(referrer);
    url.searchParams.set("save", Date.now());
    return Response.redirect(url.toString(), 302);

}

const CACHE = "json_cache";

async function readThrough(event) {

    const cache = await caches.open(CACHE);
    const matched = await cache.match(event.request);
    if( matched ) {

        log("from cache", event.request.url);
        return matched.clone();

    } else {

        log("from server", event.request.url);
        const resp = await fetch(event.request);
        log("caching", event.request.url);
        const clone = resp.clone();
        await cache.put(event.request, resp);
        log("cached", event.request.url);
        return clone;

    }

}

const idbVersion = 1;

async function cacheWrite(category, key, data) {

    return new Promise((resolve, reject) => {

        const openRequest = indexedDB.open(CACHE, idbVersion);
        openRequest.onerror = reject;
        openRequest.onupgradeneeded = oune => {
            const db = oune.target.result;
            db.createObjectStore(category, { keyPath: "key" });
            console.log("Created object store", category, "in", CACHE, "(version", idbVersion, ")");
        };
        openRequest.onsuccess = ose => {
            const db = ose.target.result;
            const transaction = db.transaction([category], "readwrite");
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
            const objectStore = transaction.objectStore(category);
            const addRequest = objectStore.put({ key, data });
            addRequest.onsuccess = () => {
                console.log("Added", {key, data});
            }
        }

    });

}