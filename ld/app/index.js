import Tenant from "./lib/model/Tenant.js";

import StorageAgent from "./DevStorageAgent.js";
import parseContext from "./context.js";
import Team from "./model/Team.js";
import taxonomy from "./taxonomy.js";

const promiseLoading = new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve));

(async function() {

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
    const index = shapes.index(taxonomy["@vocab"]);
    console.log("Shapes index:", index);

    if(!context.data) {

        const teams = await tenant.listDataSets(Team);
        console.log("Teams:", teams);
        const team = teams[0];
        console.log("Links:", team.links());

    } else {

        throw new Error("Not implemented - data home");

    }

}());