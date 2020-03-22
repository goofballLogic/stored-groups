import { required } from "../validation.js";

export default class DataSet {
    constructor(args) {
        this.ld = required(args.query, "query", "Query document for the dataset's data");
        this.type = this.ld.query("> @type");
    }

    ids() {
        return this.ld.queryAll("@id");
    }
}