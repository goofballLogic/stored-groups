import config from "../config.js";
import { publish, subscribe } from "../bus.js";
import promiseWithTimeout from "../promiseWithTimeout.js";

class Catalog {
    #promisedList

    constructor() {
        this.refresh();
    }

    async refresh() {
        this.#promisedList = promiseWithTimeout("a list of objects from storage", (resolve, reject) =>
            publish(config.bus.STORAGE.LIST_OBJECTS, {
                callback: (err, payload) => err ? reject(err) : resolve(payload.items)
            })
        );
    }

    async items() {
        return await this.#promisedList;
    }
}

export default Catalog;