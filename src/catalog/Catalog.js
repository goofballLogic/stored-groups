import config from "../config.js";
import { publish } from "../bus.js";
import Item from "./Item.js";
import EntityBase from "./EntityBase.js";
import { fetchAndCache, getCachedOrFetch } from "./data-cache.js";

function asDomainObject(item) {
    if (!item) throw new Error("Item undefined");
    const { "@type": itemType, name, "@id": relativePath, icon } = item;
    const spec = { name, icon, relativePath };
    switch (itemType) {
        case "Catalog":
            return new Catalog({ suppressLoad: true, spec });
        case "Item":
            return new Item({ suppressLoad: true, spec });
        default:
            throw new Error("Unrecognised item type: " + itemType);
    }
}

class Catalog extends EntityBase {

    // replaces the cache of promised items with a new promise of items
    async refresh() {
        await fetchAndCache(
            "a list of objects from storage",
            this.relativePath,
            callback => publish(config.bus.STORAGE.LIST_OBJECTS, {
                path: this.relativePath,
                callback
            })
        );
    }

    // fetches data items, if necessary initiating a refresh
    async dataItems() {
        const promised = await getCachedOrFetch(this.relativePath, async () => await this.refresh());
        const result = await promised;
        return (result?.items) || [];
    }

    // fetches items and returns domain objects
    async items() {
        const dataItems = await this.dataItems();
        return dataItems.map(asDomainObject);
    }
}

export default Catalog;