export const INVALID = 0;
export const FALLBACK = 0.1;
export const VALID = 1;
export const PREFERRED = 10;

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