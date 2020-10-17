import { publish } from "../bus.js";
import { fetchAndCache, getCachedOrFetch } from "./data-cache.js";
import config from "../config.js";


async function readDoc(relativePath, fetcher) {
    var result = await getCachedOrFetch(relativePath, fetcher);
    if (!result) throw new Error(`Loading failed for ${relativePath}`);
    const { doc, idbase } = result;
    if (!doc) throw new Error(`Loading failed for ${relativePath}- no document`);
    if (!idbase) throw new Error(`Loading failed for ${relativePath} - no id base`);
    return result;
}

export default class EntityBase {

    static compactType(ld) {
        const types = this.compactTypes(ld);
        return types && types[0];
    }

    static compactTypes(ld) {
        return ld?.query("@type")?.map(fragment);
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
        const { doc, idbase } = await readDoc(this.relativePath, () => this.refresh());
        this.#state.doc = doc;
        this.#state.idbase = idbase;
        const docTypes = this.types || [];
        const typeResults = await Promise.all(docTypes.map(docType =>
            readDoc(`vocab#${docType}`, () => this.loadDocType(docType))
        ));
        this.#state.typeDocs = typeResults.map(x => x.doc);
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

    get types() {
        return EntityBase.compactTypes(this.#state.doc);
    }

    get typeProps() {
        return this.#state.typeDocs
            .map(doc => doc.queryAll("prop"))
            .reduce((a, b) => [...a, ...b], []);
    }

    get props() {
        const { doc } = this.#state;
        const typeProps = this.typeProps.map(x => ({
            field: x.query("field @id"),
            label: x.query("label @value"),
            dataType: fragment(x.query("dataType @id"))
        })).map(x => ({
            ...x,
            value: doc.query(`${x.field} @value`)
        }));
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

function fragment(fqType) {
    return fqType?.substring(fqType.indexOf("#") + 1);
}

async function fetchAndCacheForTopic(description, path, fetchTopic) {
    await fetchAndCache(
        description,
        path,
        callback => publish(fetchTopic, { path, callback })
    );
}

