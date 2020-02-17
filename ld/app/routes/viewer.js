export default function viewer() {

    document.body.classList.add("view-mode");
    nameCurrentContext(queries.data, "??");

    const shape = shapeForObject(queries.data);
    document.title = `${objName} viewer`;
    const rendered = shape.queryAll("sh:property").map(p => renderPropViewer(p, queries.data)).join("");
    document.querySelector("#view").innerHTML = rendered;

}