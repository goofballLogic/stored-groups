function createButton(id, text) {
    var button = document.createElement("BUTTON");
    button.id = id;
    button.innerText = text;
    return button;
}

class Logins extends HTMLElement {

    addGoogleSignInButton() {
        var button = createButton("gapi-signin", "Google sign-in");
        button.disabled = true;
        this.appendChild(button);
    }

    addGoogleSignOutButton() {
        var button = createButton("gapi-signout", "Google sign-out");
        button.disabled = true;
        this.appendChild(button);
    }

    connectedCallback() {
        this.addGoogleSignInButton();
        this.addGoogleSignOutButton();
    }
}
window.customElements.define("login-controls", Logins);