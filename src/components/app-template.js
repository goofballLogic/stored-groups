const signedIn = (urlState) => console.log(urlState) || urlState.isCatalog ? `

    <catalog-element></catalog-element>

    ` : `

    <item-element></item-element>

`;

export default (signInState, urlState) => `

    <a href="${location.href.substring(0, location.href.indexOf("?"))}" class="catalog">Home</a>
    <login-controls></login-controls>
    ${signInState && signInState.isSignedIn ? signedIn(urlState) : "<!--not signed in-->"}

`;