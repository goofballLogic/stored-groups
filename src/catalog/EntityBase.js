import { publish } from "../bus.js";
import { fetchAndCache, getCachedOrFetch } from "./data-cache.js";

export default class EntityBase {

    static compactType(ld) {
        const fqType = (x => x ? x[0] : null)(ld?.query("@type"));
        return fqType?.substring(fqType.indexOf("#") + 1);
    }

    #state;

    constructor({ relativePath, doc, idbase, fetchTopic }) {
        this.#state = { relativePath, doc, idbase, fetchTopic };
        if ((typeof relativePath == undefined) && (!(doc && idbase)))
            throw new Error("Either a relativePath, or a doc and idbase, must be supplied");
        if (!fetchTopic)
            throw new Error("A fetchTopic must be supplied");
    }

    async load() {
        var result = await getCachedOrFetch(this.relativePath, async () => await this.refresh());
        if (!result) throw new Error("Loading failed");
        const { doc, idbase } = result;
        if (!doc) throw new Error("Loading failed - no document");
        if (!idbase) throw new Error("Loading failed - no id base");
        this.#state.doc = doc;
        this.#state.idbase = idbase;
    }

    // replaces the cache of promised document with a new promise of document
    async refresh() {
        const { fetchTopic } = this.#state;
        const path = this.relativePath;
        await fetchAndCache(
            `entity ${path} from storage`,
            this.relativePath,
            callback => publish(fetchTopic, { path, callback })
        );
    }

    get name() {
        return this.#state.doc?.query("name @value");
    }

    get icon() {
        return this.#state.doc?.query("icon @value");
    }

    get type() {
        return compactType(this.#state.doc);
    }

    get idbase() {
        return this.#state.idbase;
    }

    get doc() {
        return this.#state.doc;
    }

    get relativePath() {
        const { relativePath, doc, idbase } = this.#state;
        if (doc) {
            const docId = doc.query("@id");
            if (docId.startsWith(idbase))
                return docId.substring(idbase.length);
        }
        return relativePath || "";
    }
}
