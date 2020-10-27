import { pickView } from "../view-registry.js";

customElements.define('compound-prop-view', class extends HTMLElement {
    #props;

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        const section = document.createElement("section");
        section.appendChild(this.renderHeader());
        section.appendChild(this.renderBody());
        this.appendChild(section);
    }

    renderBody() {
        const ul = document.createElement("ul");
        this.#props.values
            .map(renderViewModel)
            .forEach(li => ul.appendChild(li));
        return ul;
    }

    renderHeader() {
        const header = document.createElement("header");
        header.textContent = this.#props.label;
        return header;
    }
});

function renderViewModel(viewModel) {
    const li = document.createElement("li");
    viewModel.props.map(renderPropView).forEach(propView => li.appendChild(propView));
    return li;
}

function renderPropView(prop) {
    const viewName = pickView(prop);
    const propView = document.createElement(viewName);
    propView.props = prop;
    return propView;
}

