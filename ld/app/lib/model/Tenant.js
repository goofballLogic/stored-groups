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
        const dataSets = expanded
            .map(x => LD(x, this[context]["@context"]))
            .map(query => new DataSet({ query, storageAgent: this[storageAgent] }));

        const objectClassType = objectClass && objectClass.typeName();
        if (objectClassType) {
            return dataSets
                .filter(dataSet => dataSet.type.includes(objectClassType))
                .map(dataSet => new objectClass({ dataSet }));
        } else {
            return dataSets;
        }
    }

    async fetchData(relativeId) {
        let expanded;
        try {
            const json = await this[storageAgent].browseRelative(relativeId);
            console.log("JSON", JSON.stringify(json));
            expanded = await jsonld.expand(json);
            console.log("Expanded", expanded);
        } catch (err) {
            throw new Error(`Failed to retrieve data\n\n${err.stack}`);
        }
        return expanded
            .map(x => LD(x, this[context]["@context"]))
            .map(query => new DataSet({ query, storageAgent: this[storageAgent] }));
    }

    async loadShapes() {
        const json = await this[storageAgent].loadShapes();
        const expanded = await jsonld.expand(json);
        const query = LD(expanded, this[context]["@context"]);
        const dataSet = new DataSet({ query, storageAgent: this[storageAgent] });
        return new Shapes({ dataSet });
    }

    relativeId(fullyQualifiedId) {
        return fullyQualifiedId && this[storageAgent].relativeId(fullyQualifiedId);
    }

}