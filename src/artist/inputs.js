const nav = ( content, maybeClass ) =>
    `<nav${maybeClass ? ` class="${maybeClass}"` : ""}>${content}</nav>`;

const div = ( className, content ) =>
    `<div ${className ? `class="${className}"` : ""}>${content}</div>`;

const label = text =>
    span( "label", text );

const labelledDiv = ( className, labelText, value ) =>
    div( className, label( labelText ) + span( "value", value ) );

const section = ( className, labelText, content ) =>
    `<section class="${className}">${label( labelText )}${content}</section>`;

const span = ( className, content ) =>
    `<span class=${className}>${content}</span>`;

const ul = lis =>
    `<ul>${lis.join( "\n" )}</ul>`;

const li = ( key, content ) =>
    `<li id="${key}">${content}</li>`;

const comment = text =>
    `<!-- ${text} -->`;

const img = ( className, src ) =>
    `<img class="${className}" src="${src}" />`;

const labelledImg = ( className, labelText, src ) =>
    labelledDiv( null, labelText, img( className, src ) );

const input = ( { name, label, inputType, readonly, value, textValue } ) =>
    `<label>
        ${span( "label-text", label)}
        <input type="${readonly ? "hidden" : inputType}" name="${name}" ${value ? `value="${value}"` : ""}" />
        ${readonly ? `<span class="readonly-text">${textValue || value}</span>` : ""}
    </label>`;

const a = ( href, className, content ) =>
    `<a href=${href} class="${className}">${content}</a>`;

module.exports = {

    a,
    comment,
    div,
    img,
    input,
    labelledDiv,
    labelledImg,
    li,
    nav,
    section,
    span,
    ul

};
