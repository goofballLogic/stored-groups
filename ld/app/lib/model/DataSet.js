import { required } from "../validation.js";
import { propertiesForShape } from "../shapes.js";


export default class DataSet {
    constructor(args) {
        this.ld = required(args.query, "query", "Query document for the dataset's data");
        this.types = this.ld.query("> @type");
    }

    id() {
        return this.ld.query("> @id");
    }

    ids() {
        return this.ld.queryAll("@id");
    }

    properties(shapeIndex) {
        if(!shapeIndex) return;
        if(!this.types) return;
        const matchedType = this.types.find(t => t in shapeIndex);
        if(!matchedType) return [];
        const shape = shapeIndex[matchedType];
        return propertiesForShape(shape);
    }
}