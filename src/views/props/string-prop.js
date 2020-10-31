import { loadStylesheet } from "../../views/stylesheets.js";

customElements.define('string-prop', class extends HTMLElement {
    #props;

    constructor() {
        super();
        loadStylesheet("props/string-prop");
    }

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        const { label, values } = this.#props;
        this.innerHTML = `${label}: ${values ? values.join(", ") : ""}`;
    }
});