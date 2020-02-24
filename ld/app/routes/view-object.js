import { renderPropViewer } from "../renderers.js";

export default function viewer({ url, docs, queries, shapeIndex }) {

    function currentShapeName(objectQuery) {
        if (!objectQuery) return url.searchParams.get("shape") || "Team";
        const objClass = objectQuery.query(">@type").filter(t => t.startsWith(docs.context.ots))[0];
        return objClass && objClass.substring(docs.context.ots.length);
    }

    function shapeForObject(objQuery) {
        const shapeName = currentShapeName(objQuery);
        return shapeName && shapeIndex[shapeName];
    }

    const shape = shapeForObject(queries.data);
    const rendered = shape.queryAll("sh:property").map(p => renderPropViewer(p, queries.data)).join("");
    document.querySelector("#view").innerHTML = rendered;

}