import contextFetcher from "./context.js";

/*
    Given:
        tenant: an object containing an id property (e.g. "10288395839203671282757")
    1. Fetches the context.jsonld from app.openteamspace.com/dev
    2. Finds the @base defined in that document
    3. Appends the tenant id and a forward slash
*/
export async function tenantUrlRoot(tenant) {
    const context = await contextFetcher();
    const urlRoot = context["@base"];
    return `${urlRoot}${tenant.id}/`;
}

/*
    Given:
        url: a URL which is a fully qualified @id of an object(e.g. https://app.openteamspace.com/dev/10288395839203671282757/test2)
        tenant: a object containing an id property (e.g. "10288395839203671282757")
    When the tenant's id does not match that found in the url, then throw an error
    When the tenant's id does match it, strip off everything up to and including the tenancy
*/
export async function tenantRelativePath(url, tenant) {
    const root = await tenantUrlRoot(tenant);
    if (!url.startsWith(root))
        throw new Error(`Path must start with ${root}`);
    return url.substr(root.length);
}