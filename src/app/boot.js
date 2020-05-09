import Tenant from "./lib/model/Tenant.js";

import StorageAgent from "./DevStorageAgent.js";
import parseContext from "./context.js";

async function boot(promiseLoading, url) {
    url = new URL(url);
    const context = parseContext(url);
    const storageAgent = new StorageAgent({ url, ...context });
    const tenant = new Tenant({ storageAgent });
    // wait for the document to load
    await promiseLoading;
    // patch the document loader for json ld
    storageAgent.patchDocumentLoader(window.jsonld);
    // trap submit events
    storageAgent.installSubmitHandler();
    // initialize the tenant
    await tenant.initialize();
    // load the shape index
    const shapes = await tenant.loadShapes();
    const shapeIndex = shapes.index();

    return { context, tenant, shapeIndex };
}

export default boot;