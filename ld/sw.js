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

    if(event.request.url.endsWith(".jsonld"))
        event.respondWith(handleFetchJSONLD(event));

});

async function handleFetchJSONLD(event) {

    switch(event.request.method) {
        case "GET":
            return readThrough(event);
        case "PUT":
            return cacheWrite(event);
        default:
            break;
    }

};

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

function cacheWrite(event) {

}