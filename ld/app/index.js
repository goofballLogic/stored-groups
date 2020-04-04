import buildViewModels from "./lib/view-models.js";
import render, { renderError } from "./lib/render/render.js";
const vocab = "http://dev.openteamspace.com/vocab/";
import boot from "./boot.js";

const promiseLoading = new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve));

(async function () {

    const { context, tenant, shapeIndex } = await boot(promiseLoading, location.href);
    console.log("Context:", context);
    console.log("Tenant:", tenant);

    console.log("Shapes index:", shapeIndex);

    const main = document.querySelector("main");

    if(context.save) {
        const notification = document.createElement("ASIDE");
        notification.classList.add("notification");
        setTimeout(() => notification.remove(), 10000);
        notification.textContent = "Saved: " + context.save.toLocaleString();
        main.parentElement.insertBefore(notification, main);
    }

    try {
        const dataSets = context.data
            ? await tenant.fetchData(context.data)
            : await tenant.listDataSets();

        const choiceDataSet = context.choice && ((await tenant.fetchData(context.choice))[0]);

        const viewModels = buildViewModels({ dataSets, choiceDataSet, tenant, shapeIndex, context, vocab });
        console.log("View models", viewModels);

        render(main, viewModels, context);

    }
    catch (err) {

        renderError(main, err, context);
        console.error(err);

    }

}());