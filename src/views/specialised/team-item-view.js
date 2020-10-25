import { loadStylesheet } from "../stylesheets.js";
import { registerView, pickView } from "../view-registry.js";
import placeholder from "./team-item-icon-default.js";

registerView("team-item-view", props => (props.type === "Item" && props.types.includes("Team")) ? 2 : 0);

customElements.define('team-item-view', class extends HTMLElement {

    #props;

    constructor() {
        super();
        loadStylesheet("specialised/team-item-view");
    }

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        this.innerHTML = "";
        try {
            this.appendChild(this.renderIcon());
            this.appendChild(this.renderHeading());
            console.log(this.#props);
            this.#props?.viewModel
                ?.filter(prop => prop.compactField !== "name")
                .forEach(prop => {
                    const propViewName = pickView(prop);
                    const propView = document.createElement(propViewName);
                    propView.props = prop;
                    this.appendChild(propView);
                });
        } catch (err) {
            this.textContent = err.stack;
        }
    }

    renderIcon() {
        const img = document.createElement("IMG");
        img.src = this.#props.icon || placeholder;
        return img;
    }

    renderHeading() {
        const h3 = document.createElement("H3");
        h3.textContent = this.#props.name;
        return h3;
    }

});