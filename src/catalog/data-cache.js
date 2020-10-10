import promiseWithTimeout from "../promiseWithTimeout.js";

const cache = {};

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
                resolve(payload.items);
            }

        })
    );
    cache[key] = promisedFetch;
    await promisedFetch;

}