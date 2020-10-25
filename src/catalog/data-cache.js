import promiseWithTimeout from "../promiseWithTimeout.js";
import { subscribe } from "../bus.js";
import config from "../config.js";

subscribe(config.bus.SIGNED_IN, () => cache = {});

let cache = {};

export function invalidate(key) {
    delete cache[key];
}

export async function getCachedOrFetch(key, fetcher) {
    if (!(key in cache))
        await fetcher();
    return cache[key]
}

export async function fetchAndCache(description, key, fetcher) {

    const promisedFetch = promiseWithTimeout(
        description,
        (resolve, reject) => fetcher(function callback(err, payload) {
            if (err) {
                reject(err);
                if (cache[key] === promisedFetch)
                    delete cache[key]
            } else {
                resolve(payload);
            }

        })
    );
    cache[key] = promisedFetch;
    await promisedFetch;

}