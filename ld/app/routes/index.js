import browser from "./browser.js";
import collectionBrowser from "./collection-browser.js";
import editor from "./editor.js";
import viewer from "./viewer.js";

export default {
    "edit": {
        handler: editor
    },
    "browse": {
        handler: browser
    },
    "view": {
        handler: viewer
    },
    "browse-collection": {
        handler: collectionBrowser
    }
}