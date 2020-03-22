import classBrowser from "./class-browser.js";
import editor from "./editor.js";

import viewCollection from "./view-collection.js";
import viewObject from "./view-object.js";

const url = new URL(location.href);
url.search = "";
url.hash = "";

function newURL() { return new URL(url); }

function decorateSearch(url, bits) {
    if(bits) {
        Object.entries(bits).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }
    return url;
}

function requireParam(name, value) {
    if(value === null || value === undefined || value === "") throw new Error(`Required ${name} is ${value}`);
}

export default {
    // --- deprecated
    "browse": {
        handler: classBrowser
    },
    // ---
    "view": {
        handler: viewObject,
        url: (id) => {
            requireParam("id", id);
            return decorateSearch(newURL(), {
                mode: "view",
                id: btoa(id)
            });
        }
    },
    "view-collection": {
        handler: viewCollection,
        url: (collectionId, prop, parentId) => {
            return decorateSearch(newURL(), {
                mode: "view-collection",
                "collection-id": btoa(collectionId),
                "prop": btoa(prop),
                "parent-id": btoa(parentId)
            });
        }
    },

    "edit": {
        handler: editor,
        url: () => {
            return decorateSearch(newURL());
        }
    }
}