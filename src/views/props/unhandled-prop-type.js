customElements.define('unhandled-prop-type', class extends HTMLElement {
    #props;

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        this.innerHTML = "Unhandled prop type " + JSON.stringify(this.#props);
    }
});