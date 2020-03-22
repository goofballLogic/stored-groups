import { build as buildFetchers } from "../lib/fetcher.js";
import ld from "../lib/ld.js";

const tenantRootUrl = "/ots/tenant-1";
const urls = {
    root: tenantRootUrl,
    home: `${tenantRootUrl}/teams`,
    context: `${tenantRootUrl}/context`,
    schema: `${tenantRootUrl}/schema`
};

const maybeAtob = x => x && atob(x);
export async function build(url, tenant) {

    // const context
    const current = {
        dataRoot: tenantRootUrl
    };

    /*
        This detects any context which can be determined from the URL itself without any additional data fetching
        For example, the URL may contain a querystring indicating what the current page represents:
         - id of an
         - id of an object which is a collection
         - ids of a parent object and property from which the current object/collection has been reached
    */
    Object.assign(current, {
        mode: url.searchParams.get("mode") || "browse",
        id: maybeAtob(url.searchParams.get("id")),
        collection: maybeAtob(url.searchParams.get("collection-id")),
        parent: maybeAtob(url.searchParams.get("parent-id")),
        prop: maybeAtob(url.searchParams.get("prop"))
    });

    /*
        Various utilities for fetching data
    */
    const { fetchAndExpandDocuments, fetchDocuments, fetchAndExpandObjects } = buildFetchers(urls.root, tenant);
    const { LD } = ld;

    const [
        [contextData],
        [schemaData, collectionData, homeData],
        [idData, parentData]
    ] = await Promise.all([
        fetchDocuments(urls.context),
        fetchAndExpandDocuments(urls.schema, current.collection, urls.home),
        fetchAndExpandObjects(current.id, current.parent),
    ]);

    const context = contextData["@context"];
    const dataForDataQuery = idData || collectionData || homeData;
    Object.assign(current, {
        docs: {
            context
        },
        queries: {
            schema: schemaData && LD(schemaData, context),
            data: dataForDataQuery && LD(dataForDataQuery, context),
            parent: parentData && LD(parentData, context)
        }
    });

    return current;

}