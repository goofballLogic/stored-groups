import buildViewModels from "./lib/view-models.js";
import render, { renderError } from "./lib/render/render.js";

export default async function run({ log, context, main, tenant, shapeIndex }) {
    if (context.save) {
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
        const viewModels = buildViewModels({ dataSets, choiceDataSet, tenant, shapeIndex, context });
        log("View models", viewModels);
        render(main, viewModels, context);
    }
    catch (err) {
        renderError(main, err, context);
        console.error(err);
    }
}
