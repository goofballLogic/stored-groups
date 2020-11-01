import { pickView, registerView } from "./view-registry.js";
import placeholder from "./item-icon-default.js";

registerView("item-view", props => props.type === "Item" ? 1 : 0);

export class ItemView extends HTMLElement {

    #props;

    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        this.innerHTML = "";
        try {
            this.renderLoop();
        } catch (err) {
            this.textContent = err.stack;
        }
    }

    renderLoop() {
        this.appendChild(this.renderIcon());
        this.appendChild(this.renderHeading());
        this.propsToRender().forEach(x => this.renderProp(x));
    }

    renderProp(prop) {
        const propViewName = pickView(prop);
        const propView = document.createElement(propViewName);
        propView.props = prop;
        this.appendChild(propView);
    }

    propsToRender() {
        return this.#props
            ?.viewModel
            ?.props
            .filter(prop => prop.compactField !== "name");
    }

    renderIcon() {
        const img = document.createElement("IMG");
        if (this.#props.icon)
            img.src = this.#props.icon;
        return img;
    }

    renderHeading() {
        const h3 = document.createElement("H3");
        h3.textContent = this.#props.name;
        return h3;
    }
}

customElements.define('item-view', class extends ItemView {

    renderIcon() {
        const img = super.renderIcon();
        img.src = img.src || placeholder;
        return img;
    }

});