export const defaultPropView = "unhandled-prop-type";
export const compoundPropView = "compound-prop-view";
export const propViews = {
    "string": "string-prop",
};

const viewRegistry = {};

export function registerView(viewName, selector) {
    viewRegistry[viewName] = selector;
}

export function pickView(props) {
    let score = 0;
    let chosen = null;
    for (let key in viewRegistry) {
        const candidateScore = viewRegistry[key](props);
        if (candidateScore > score) {
            score = candidateScore;
            chosen = key;
        }
    }
    return chosen;
}