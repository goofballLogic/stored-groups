import { loadStylesheet } from "../stylesheets.js";
import { registerView, pickView } from "../view-registry.js";
import { ItemView } from "../item-view.js";

import placeholder from "./team-item-icon-default.js";

registerView("team-item-view", props => (props.type === "Item" && props.types.includes("Team")) ? 2 : 0);

customElements.define('team-item-view', class extends ItemView {

    constructor() {
        super();
        loadStylesheet("specialised/team-item-view");
    }

    renderIcon() {
        const icon = super.renderIcon();
        console.log(icon);
        icon.src = icon.src || placeholder;
        return icon;
    }
});