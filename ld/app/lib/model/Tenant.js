import { LD, jsonld } from "../../../lib/extern.js";
import DataSet from "./DataSet.js";
import Shapes from "./Shapes.js";

const storageAgent = Symbol("storage agent");
const shapes = Symbol("shapes");
const context = Symbol("context document");

export default class Tenant {

    constructor({ storageAgent: agent }) {
        this[storageAgent] = agent;
        this.initialized = false;
    }

    async initialize() {
        this[context] = await this[storageAgent].loadContext();
        const json = this[storageAgent].loadShapes();
        const expanded = await jsonld.expand(json);
        this[shapes] = LD(expanded, this[context]["@context"]);
        this.initialized = true;
    }

    async listDataSets(objectClass) {
        const json = await this[storageAgent].browseRoot();
        const expanded = await jsonld.expand(json);
        const objectClassType = objectClass.typeName();
        return expanded
            .map(x => LD(x, this[context]["@context"]))
            .map(query => new DataSet({ query, storageAgent: this[storageAgent] }))
            .filter(dataSet => dataSet.type.includes(objectClassType))
            .map(dataSet => new objectClass({ dataSet }));
    }

    async loadShapes() {
        const json = await this[storageAgent].loadShapes();
        const expanded = await jsonld.expand(json);
        const query = LD(expanded, this[context]["@context"]);
        const dataSet = new DataSet({ query, storageAgent: this[storageAgent] });
        return new Shapes({ dataSet });
    }

}