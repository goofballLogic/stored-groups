import EntityBase from "./EntityBase.js";
import config from "../config.js";
import { publish } from "../bus.js";
import { fetchAndCache, getCachedOrFetch } from "./data-cache.js";

export default class Item extends EntityBase {

    #doc;

    // replaces the cache of promised document with a new promise of document
    async refresh() {
        await fetchAndCache(
            "a document from storage",
            this.relativePath,
            callback => publish(
                config.bus.STORAGE.FETCH_OBJECT,
                { path: this.relativePath, callback }
            )
        );
    }

    async load() {
        var result = await getCachedOrFetch(this.relativePath, async () => await this.refresh());
        if (!(result?.query)) throw new Error("Query missing");
        this.#doc = result.query;
    }

    render() {
        return this.#doc?.query("*");
    }
}