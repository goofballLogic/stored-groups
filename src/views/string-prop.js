customElements.define('string-prop', class extends HTMLElement {
    #props;

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        const { label, values } = this.#props;
        this.innerHTML = `<div>${label}: ${values ? values.join(", ") : ""}</div>`;
    }
});