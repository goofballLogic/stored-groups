customElements.define('linked-remote-prop', class extends HTMLElement {
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
        console.log(this.#props);
        if (hrefs.length == 1) {
            this.innerHTML = `<a class="internal" href=${hrefs[0]}>${label}</a>`;
        } else if (hrefs.length == 0) {
            this.innerHTML = `${label}`;
        } else {
            this.innerHTML = `Unhandled: ${label} ${hrefs}`;
        }
    }
});