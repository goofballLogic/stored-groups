const mapIf = async (xs, func) =>
    Promise.all(Array.from(xs).map(x =>
        x && func(x)
    ));

export function build(basePath, tenant) {

    return {
        fetchAndExpandDocuments,
        fetchDocuments,
        fetchAndExpandObjects
    };

    async function fetchAndExpandDocuments() {
        return await mapIf(arguments, fetchAndExpandDocument);
    }

    async function fetchDocuments() {
        return await mapIf(arguments, fetchDocument);
    }

    async function fetchAndExpandObjects() {
        return await mapIf(arguments, fetchAndExpandObject);
    }

    async function fetchDocument(o) {
        const url = new URL(o, location.href);
        const path = url.pathname.substring(basePath.length);
        const resp = await fetch(`/data/${path}/index.jsonld`);
        return await resp.json();
    }

    async function fetchAndExpandDocument(o) {
        const json = await fetchDocument(o);
        return jsonld.expand(json);
    }

    async function fetchAndExpandObject(o) {
        const container = o.substring(0, o.lastIndexOf("/"));
        return await fetchAndExpandDocument(container);
    }

}