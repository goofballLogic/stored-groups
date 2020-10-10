import EntityBase from "./EntityBase.js";
import config from "../config.js";

export default class Item extends EntityBase {

    constructor(options) {
        super({ ...options, fetchTopic: config.bus.STORAGE.FETCH_OBJECT });
    }

    render() {
        return this.doc?.query("*");
    }
}