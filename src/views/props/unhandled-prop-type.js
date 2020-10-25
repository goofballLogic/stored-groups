customElements.define('unhandled-prop-type', class extends HTMLElement {
    connectedCallback() {
        this.innerHTML = "unhadled prop type";
    }
});