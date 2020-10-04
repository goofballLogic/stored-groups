import config from "../config.js";
import { publish, subscribe } from "../bus.js";
import promiseWithTimeout from "../promiseWithTimeout.js";
import Item from "./Item.js";
import EntityBase from "./EntityBase.js";

function asDomainObject(item) {
    if (!item) throw new Error("Item undefined");
    const { "@type": itemType, name, "@id": relativePath } = item;
    const spec = { name, relativePath };
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
    #promisedList

    constructor(options) {
        super(options);
        const suppressLoad = options && options.suppressLoad;
        if (!suppressLoad) this.refresh();
    }

    refresh() {
        this.#promisedList = promiseWithTimeout("a list of objects from storage", (resolve, reject) =>
            publish(config.bus.STORAGE.LIST_OBJECTS, {
                path: this.extract("relativePath"),
                callback: (err, payload) => err ? reject(err) : resolve(payload.items)
            })
        );
    }

    async items() {
        if (!this.#promisedList) this.refresh();
        const dataItems = await this.#promisedList;
        return dataItems.map(asDomainObject);
    }
}

export default Catalog;