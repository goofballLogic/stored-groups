import { compoundPropView, propViews, defaultPropView } from "./view-registry.js";
import placeholder from "./item-icon-default.js";
import { loadStylesheet } from "./stylesheets.js";

customElements.define('item-view', class extends HTMLElement {

    #props;

    constructor() {
        super();
        loadStylesheet("item-view");
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
        this.appendChild(this.renderIcon());
        this.appendChild(this.renderHeading());
        this.#props?.viewModel?.forEach(prop => {
            const tagName = prop.compoundType ? compoundPropView : propViews[prop.dataType] || defaultPropView;
            const propView = document.createElement(tagName);
            propView.props = prop;
            this.appendChild(propView);
        });
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