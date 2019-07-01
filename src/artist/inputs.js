const nav = content =>
    `<nav>${content}</nav>`;

const div = ( className, content ) =>
    `<div class="${className}">${content}</div>`;

const labelledDiv = ( className, label, value ) =>
    div( className, `<span class="label">${label}</span><span class="value">${value}</span>` );

const ul = lis =>
    `<ul>${lis.join( "\n" )}</ul>`;

const li = ( key, content ) =>
    `<li id="${key}">${content}</li>`;

const comment = text =>
    `<!-- ${text} -->`;

const input = ( { name, label, inputType, readonly, value, textValue } ) =>
    `<label>
        <span class="label-text">${label}</span>
        <input type="${readonly ? "hidden" : inputType}" name="${name}" />
        ${readonly ? `<span class="readonly-text">${textValue || value}</span>` : ""}
    </label>`;

module.exports = {

    comment,
    div,
    input,
    labelledDiv,
    li,
    nav,
    ul

};
