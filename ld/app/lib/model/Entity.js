import { required } from "../validation.js";

export const data = Symbol("data");

export default class Entity {
    constructor({ dataSet }) {
        this[data] = required(dataSet, "dataSet", "The dataset containing data for this entity");
        this.id = dataSet.ld.query("> @id");
        this.name = dataSet.ld.query("ots:name @value");
    }

    links() {
        return this[data].ids();
    }
};