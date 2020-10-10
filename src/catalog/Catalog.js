import config from "../config.js";
import Item from "./Item.js";
import EntityBase from "./EntityBase.js";

function asDomainObject(doc, idbase) {
    if (!doc) throw new Error("Item undefined");
    const itemType = EntityBase.compactType(doc);
    switch (itemType) {
        case "Catalog":
            return new Catalog({ doc, idbase });
        case "Item":
            return new Item({ doc, idbase });
        default:
            throw new Error("Unrecognised item type: " + itemType);
    }
}

class Catalog extends EntityBase {

    constructor(options) {
        super({ ...options, fetchTopic: config.bus.STORAGE.LIST_OBJECTS });
    }

    async items() {
        await this.load();
        return this.doc.queryAll("*[@id]").map(x => asDomainObject(x, this.idbase));

    }
}

export default Catalog;