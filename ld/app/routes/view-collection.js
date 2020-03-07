export default function collectionBrowser({ prop, queries, docs, emplace, shapeIndex }) {
console.log(arguments);
    const { parent } = queries;

    const name = parent.query("ots:name @value");
    emplace(".current-owner-name", name);

    const parentShape = shapeIndex.shapeForObject(parent);
console.log("parentShape", parentShape.json());
    const propShape = 
console.log("prop", prop);
    const propData = parent.query(prop);
console.log("propData", propData.json());
    const label = propData.query("sh:labelTemplate @value") || prop.query("sh:path @id");
    emplace(".current-collection-name", label);

    document.body.classList.add("browse-collection-mode");

    const objs = parent.queryAll(prop);
    const itemsList = document.querySelector("#browse-collection-mode #items");
    itemsList.innerHTML = objs.map(renderChildViewerLink).join("\n");
}