const signedIn = (urlState) => urlState.isCatalog ? `

    <catalog-element></catalog-element>

    ` : `

    <item-element></item-element>

`;

export default (signInState, urlState) => `

    <login-controls></login-controls>
    ${signInState && signInState.isSignedIn ? signedIn(urlState) : "<!--not signed in-->"}

`;