export default function collectionBrowser() {

    const parent = currentObject(true);
    const name = parent.query("ots:name @value");
    emplaceText(".current-owner-name", name);

    const propShape = currentPropShape(true);
    const prop = propShape.query("sh:path @id");
    const label = propShape.query("sh:labelTemplate @value") || prop.query("sh:path @id");
    emplaceText(".current-collection-name", label);

    document.body.classList.add("browse-collection-mode");

    const objs = parent.queryAll(prop);
    const itemsList = document.querySelector("#browse-collection-mode #items");
    itemsList.innerHTML = objs.map(renderChildViewerLink).join("\n");
}