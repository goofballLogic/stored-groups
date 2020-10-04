const signedIn = () => `

    <catalog-controls></catalog-controls>

`;

export default signInState => `

    <login-controls></login-controls>
    ${signInState && signInState.isSignedIn ? signedIn() : "<!--not signed in-->"}

`;