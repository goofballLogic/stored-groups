import { required } from "../validation.js";
import ShapeProperty from "./ShapeProperty.js";

export default class DataSet {
    constructor(args) {
        this.ld = required(args.query, "query", "Query document for the dataset's data");
        this.types = this.ld.query("> @type");
    }

    ids() {
        return this.ld.queryAll("@id");
    }

    properties(shapeIndex) {
        if(!shapeIndex) return;
        if(!this.types) return;
        const matchedType = this.types.find(t => t in shapeIndex);
        if(!matchedType) return;
        const shape = shapeIndex[matchedType];
        return shape.queryAll("sh:property")
            .map(p => new ShapeProperty(p))
            .filter(p => p.path);
    }
}