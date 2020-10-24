const loaded = {};

export function loadStylesheet(name) {
    if (loaded[name]) return;
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", `./views/${name}.css`);
    document.head.appendChild(link);
    loaded[name] = true;
}