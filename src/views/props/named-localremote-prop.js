import { loadStylesheet } from "../stylesheets.js";

customElements.define('named-localremote-prop', class extends HTMLElement {
    #props;

    constructor() {
        super();
        loadStylesheet("props/named-localremote-prop");
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
        const valueProp = values[0].props?.find(x => x.compactField === "name");
        this.innerHTML = `${label}: ${valueProp?.values[0] || ""}`;
    }
});