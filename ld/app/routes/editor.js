export default function editor() {

    document.body.classList.add("edit-mode");
    const objectQuery = current.queries.data;
    nameCurrentContext(objectQuery, "new", x => `Editing ${x}`);

    const shapeName = currentShapeName(objectQuery);

    function render(shapeName) {
        const shape = shapeIndex[shapeName];
        const rendered = shape
            .queryAll("sh:property")
            .map(propQuery => renderPropEditor(propQuery, objectQuery))
            .join("");
        document.querySelector("#editor .inputs").innerHTML = rendered;
    }

    render(shapeName);

}