import { publish } from "../bus.js";
import { fetchAndCache, getCachedOrFetch } from "./data-cache.js";
import config from "../config.js";

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
        const docType = this.type;
        var typeResult = await getCachedOrFetch(`vocab#${docType}`, async () => await this.loadDocType(docType));
        this.#state.typeDoc = typeResult.doc;
    }

    async loadDocType(docType) {
        return await fetchAndCacheForTopic(
            `type ${docType} from storage`,
            `vocab#${docType}`,
            config.bus.STORAGE.FETCH_OBJECT
        );
    }

    // replaces the cache of promised document with a new promise of document
    async refresh() {
        const path = this.relativePath;
        await fetchAndCacheForTopic(
            `entity ${path} from storage`,
            path,
            this.#state.fetchTopic
        );
    }

    get name() {
        return this.#state.doc?.query("name @value");
    }

    get icon() {
        return this.#state.doc?.query("icon @value");
    }

    get type() {
        return EntityBase.compactType(this.#state.doc);
    }

    get typeProps() {
        const { typeDoc } = this.#state;
        window.x = typeDoc;
        return typeDoc.queryAll("prop");
    }

    get props() {
        const { doc } = this.#state;
        const typeProps = this.typeProps.map(x => ({
            field: x.query("field @id"),
            label: x.query("label @value"),
            dataType: x.query("dataType")
        })).map(x => ({
            ...x,
            value: doc.query(`${x.field} @value`)
        }));
        console.log(typeProps);
        return typeProps;
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
async function fetchAndCacheForTopic(description, path, fetchTopic) {
    await fetchAndCache(
        description,
        path,
        callback => publish(fetchTopic, { path, callback })
    );
}

