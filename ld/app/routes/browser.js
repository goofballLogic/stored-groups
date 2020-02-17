import { maybeAtob } from "../../lib/encoding.js";
import { renderChildViewerLink } from "../renderers.js";

export default function browser({ url, docs, queries, emplace }) {

    const currentClass = maybeAtob(url.searchParams.get("class")) || `${docs.context.ots}Team`;
    const currentClassPropQuery = queries.schema.queryAll(`sh:class[@id=${currentClass}]`)
        .map(x => x.parent())
        .filter(x => !x.query("sh:maxCount"))
    [0];
    const currentClassName =
        (currentClassPropQuery && currentClassPropQuery.query("sh:labelTemplate @value"))
        || currentClass.substring(docs.context.ots.length) + "s";
    emplace(".current-class-name", currentClassName);

    document.body.classList.add("browse-mode");

    const objs = queries.data.queryAll(`[@type=${currentClass}]`);
    const itemsList = document.querySelector("#browse-mode #items");
    itemsList.innerHTML = objs.map(renderChildViewerLink).join("\n");

}