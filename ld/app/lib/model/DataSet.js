import { required } from "../validation.js";
import { propertiesForShape } from "../shapes.js";

const readonly = Symbol("readonly");

export default class DataSet {
    constructor(args) {
        this.ld = required(args.query, "query", "Query document for the dataset's data");
        this.types = this.ld.query("> @type");
        if(args.readonly) {
            this[readonly] = true;
        } else {
            this.editsUrl = required(args.editsUrl, "editsUrl", "URL to POST edits for this dataset");
        }
    }

    get readonly() {
        return this[readonly];
    }

    buildSubset({ query }) {
        return new DataSet({ query, readonly: true });
    }

    id() {
        return this.ld.query("> @id");
    }

    ids() {
        return this.ld.queryAll("@id");
    }

    compactTypes(context) {
        console.log(context);
    }

    properties(shapeIndex) {
        console.log(this.ld.json());
        if(!shapeIndex) return;
        if(!this.types) return;
        const matchedType = this.types.find(t => t in shapeIndex);
        if(!matchedType) return [];
        const shape = shapeIndex[matchedType];
        return propertiesForShape(shape);
    }
}