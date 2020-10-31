customElements.define('linked-object-prop', class extends HTMLElement {
    #props;

    /**
     * @param {object} value
     */
    set props(value) {
        this.#props = value;
        this.render();
    }

    render() {
        const { label, hrefs } = this.#props;
        if (hrefs.length == 1) {
            this.innerHTML = `<a class="internal" href=${hrefs[0]}>${label}</a>`;
        } else {
            this.innerHTML = `Unhandled: ${label} ${hrefs}`;
        }
    }
});