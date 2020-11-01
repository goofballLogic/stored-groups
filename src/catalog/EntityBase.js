import { publish } from "../bus.js";
import { fetchAndCache, getCachedOrFetch, invalidate as invalidateCache } from "./data-cache.js";
import config from "../config.js";
import { buildItemLink } from "../nav.js";

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
        if (typeof relativePath == undefined) throw new Error("Can't load an entity initialized with a document");
        const { doc, idbase } = await readDoc(this.relativePath, () => this.refresh());
        this.#state.doc = doc;
        this.#state.idbase = idbase;
        await this.loadTypeDocs(this.types);
    }

    async loadTypeDocs(docTypes) {
        const typeDocs = this.#state.typeDocs = this.#state.typeDocs || {};
        if (docTypes && docTypes.length) {
            await Promise.all(docTypes.map(async docType => {
                const result = await readDoc(`vocab#${docType}`, () => loadDocType(docType), true);
                typeDocs[docType] = result.doc;
            }));
            const missingTypes = Object.values(typeDocs)
                .filter(x => x)
                .map(d => d.queryAll("dataType @id"))
                .reduce((a, b) => [...a, ...b], [])
                .filter(dataType => dataType && dataType.startsWith(ots))
                .map(dataType => fragment(dataType))
                .filter(dataType => !(dataType in typeDocs));
            await this.loadTypeDocs(missingTypes);
        }
    }

    invalidate() {
        const path = this.relativePath;
        invalidateCache(path);
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
        return this.#state.doc?.query("> name @value");
    }

    get icon() {
        return this.#state.doc?.query("> icon @value");
    }

    get type() {
        return EntityBase.compactType(this.#state.doc);
    }

    get types() {
        return EntityBase.compactTypes(this.#state.doc);
    }

    get viewModel() {
        const { doc, typeDocs } = this.#state;
        const ret = buildViewModel(doc, typeDocs, this.idbase);
        return ret;
    }

    get idbase() {
        return this.#state.idbase;
    }

    get doc() {
        return this.#state.doc;
    }

    get relativePath() {
        const { relativePath, doc, idbase } = this.#state;
        if (relativePath || relativePath === "") return relativePath;
        if (doc) {
            const docId = doc.query("> @id");
            if (docId.startsWith(idbase))
                return docId.substring(idbase.length);
        }
    }
}

async function readDoc(relativePath, fetcher, missingDocAllowed = false) {
    var result = await getCachedOrFetch(relativePath, fetcher);
    if (!result) throw new Error(`Loading failed for ${relativePath}`);
    const { doc, idbase } = result;
    if (!(doc || missingDocAllowed)) throw new Error(`Loading failed for ${relativePath}- no document`);
    if (!idbase) throw new Error(`Loading failed for ${relativePath} - no id base`);
    return result;
}

async function loadDocType(docType) {
    return await fetchAndCacheForTopic(
        `type ${docType} from storage`,
        `vocab#${docType}`,
        config.bus.STORAGE.FETCH_OBJECT
    );
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

const unique = stuff => stuff.reduce((ret, x) => ret.includes(x) ? ret : [...ret, x], []);
const ots = "https://app.openteamspace.com/vocab#";

function buildViewModel(doc, typeDictionary, idbase) {

    return viewModelFor(doc);

    function viewModelFor(node, expectedTypes = []) {

        const props = buildViewProps();
        const id = node.query("> @id");
        return { id, props };

        function requiredTypeDoc(typeName) {
            const key = fragment(typeName);
            const typeDoc = typeDictionary[key];
            if (!typeDoc) throw new Error(`Missing type document: ${typeName}`);
            return typeDoc;
        }

        function buildViewProps() {
            return unique([].concat(node.query("> @type")).concat(expectedTypes).filter(x => x)) // for each type of this item
                .map(docType => requiredTypeDoc(docType)) // look up the type document of each type
                .map(typeDoc => typeDoc ? typeDoc.queryAll("> prop") : []) // extract the properties from each type document
                .reduce((a, b) => [...a, ...b], []) // combine lists of properties together
                .map(prop => extractPropertyMetadata(prop)) // extract the property definitions
                .map(metadata => extractPropertyValues(metadata)); // add values
        }

        function extractPropertyValues(metadata) {

            const values = metadata.localRemote
                ? buildViewModelForLocalRemote(metadata)
                : metadata.compoundType
                    ? node.queryAll(`> ${metadata.field}`).map(child => viewModelFor(child, metadata.dataTypes))
                    : node.queryAll(`> ${metadata.field} > @value`);
            const ids = node.queryAll(`> ${metadata.field} > @id`);
            const hrefs = ids
                .map(x => x.startsWith(idbase) ? x.substring(idbase.length) : x)
                .map(relativePath => buildItemLink({ relativePath }));
            return ({
                ...metadata,
                values,
                ids,
                hrefs
            });
        }

        function buildViewModelForLocalRemote(metadata) {
            const propNode = node.query(`> ${metadata.field}`);
            const nodeId = propNode.query("@id");
            const nodeSelector = `#${nodeId}`;
            const matchingNodes = doc.queryAll(nodeSelector);
            const viewModels = matchingNodes.map(n => viewModelFor(n, metadata.dataTypes));
            const propIndex = viewModels
                .map(x => x.props)
                .reduce((a, b) => [...a, ...b])
                .reduce((index, x) => ({
                    ...index,
                    [x.field]: [].concat(index[x.field] || [], x)
                }), {});
            const props = Object.values(propIndex).map(([a, ...others]) => ({
                ...a,
                ids: others.reduce((xs, x) => [...xs, ...x.ids], a.ids),
                hrefs: others.reduce((xs, x) => [...xs, ...x.hrefs], a.hrefs),
                values: others.reduce((xs, x) => [...xs, ...x.values], a.values)
            }));
            return [{ id: nodeId, props }];
        }

        function extractPropertyMetadata(prop) {
            const dataTypes = prop.queryAll("> dataType @id");
            const dataType = dataTypes[0];
            const dataTypeFragment = fragment(dataType);
            const fieldId = prop.query("> field @id");
            return ({
                field: fieldId,
                compactField: fragment(fieldId),
                label: prop.query("> label @value"),
                dataType: dataTypeFragment,
                qualifiedDataType: dataType,
                dataTypes,
                compoundType: dataType.startsWith(ots),
                defaultValue: prop.query("> ots:defaultValue @value"),
                remote: !!prop.query("> ots:remote @value"),
                localRemote: !!prop.query("> ots:local-remote @value")
            });
        }
    }
}
