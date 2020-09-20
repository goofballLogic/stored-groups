import contextFetcher from "../context.js";

export async function gapiRelativePath(url, tenant) {
    const context = await contextFetcher();
    const urlRoot = context["@base"];
    const tenantRoot = `${urlRoot}${tenant.id}/`;
    if (!url.startsWith(tenantRoot))
        throw new Error(`Path must start with ${tenantRoot}`);
    return url.substr(tenantRoot.length);
}