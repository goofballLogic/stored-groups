import { compoundPropView, propViews, defaultPropView, registerView } from "../view-registry.js";
import placeholder from "./team-item-icon-default.js";

registerView("team-item-view", props => (props.type === "Item" && props.types.includes("Team")) ? 2 : 0);

customElements.define('team-item-view', class extends HTMLElement {

    #props;

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        this.innerHTML = "";
        console.log(this.#props.types);
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