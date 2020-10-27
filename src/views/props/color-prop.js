import { loadStylesheet } from "../../views/stylesheets.js";

customElements.define('color-prop', class extends HTMLElement {
    #props;

    constructor() {
        super();
        loadStylesheet("props/color-prop");
    }

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        const { label, values, defaultValue } = this.#props;
        this.innerHTML = `${label}: <span style="background-color: ${values[0] || defaultValue};" class="swatch" />`;
    }
});