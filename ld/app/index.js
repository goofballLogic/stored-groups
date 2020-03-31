import Tenant from "./lib/model/Tenant.js";

import StorageAgent from "./DevStorageAgent.js";
import parseContext from "./context.js";
import buildViewModels from "./lib/view-models.js";
import render, { renderError } from "./lib/render/render.js";

const promiseLoading = new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve));

(async function () {

    const url = new URL(location.href);

    const context = parseContext(url);
    const storageAgent = new StorageAgent({ url, ...context });
    const tenant = new Tenant({ storageAgent });

    // wait for the document to load
    await promiseLoading;

    // patch the document loader for json ld
    storageAgent.patchDocumentLoader(window.jsonld);

    // initialize the tenant
    await tenant.initialize();

    console.log("Context:", context);
    console.log("Tenant:", tenant);

    const shapes = await tenant.loadShapes();
    console.log("Shapes:", shapes);
    const shapeIndex = shapes.index();
    console.log("Shapes index:", shapeIndex);

    try {
        const dataSets = context.data
            ? await tenant.fetchData(context.data)
            : await tenant.listDataSets();

        const viewModels = buildViewModels(dataSets, tenant, shapeIndex, context);
        console.log("View models", viewModels);

        render(document.body, viewModels, context);

    }
    catch (err) {

        renderError(document.body, err, context);
        console.error(err);

    }

}());

