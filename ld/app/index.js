import boot from "./boot.js";
import run from "./app.js";

const promiseLoading = new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve));
const log = console.log.bind(console);

(async function () {

    const { context, tenant, shapeIndex } = await boot(promiseLoading, location.href);
    log("Context:", context);
    log("Tenant:", tenant);
    log("Shapes index:", shapeIndex);

    const main = document.querySelector("main");
    document.querySelector("a.tenant-home").href = context.tenantHomeURL;

    run({ log, context, main, tenant, shapeIndex });

    const pre = document.createElement("pre");
    pre.textContent = Array.from((new URL(location.href)).searchParams)
        .concat({0: "context", 1: JSON.stringify(context, null, 1)})
        .map(x => `${x[0]} : ${x[1]}`).join("\n");
    document.body.appendChild(pre);

}());