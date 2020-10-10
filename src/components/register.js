export function defineElement(elementName, elementClass) {

    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", `/components/${elementName}.css`);
    document.head.appendChild(link);
    window.customElements.define(elementName, elementClass);

}