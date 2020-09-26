import config from "../config.js";
import { publish } from "../bus.js";

const { API_KEY, DISCOVERY_DOCS, CLIENT_ID, SCOPES } = config.drive;

export function load(gapi, { signInButton, signOutButton }) {

    // 1. Load the JavaScript client library.
    gapi.load('client:auth2', handleGAPIAuth2ClientLoaded);

    function handleGAPIAuth2ClientLoaded() {
        // 2. Initialize the JavaScript client library.
        const opts = {
            'apiKey': API_KEY,
            'discoveryDocs': DISCOVERY_DOCS,
            'clientId': CLIENT_ID,
            'scope': SCOPES,
        };
        gapi.client.init(opts).then(handleGAPIInitSuccess, handleGAPIInitFailure);
    }

    function handleGAPIInitFailure(err) {
        publish(config.bus.ERROR, { err })
    }

    function handleGAPIInitSuccess() {
        // enable login/out
        signInButton.addEventListener("click", handleSignInButtonClick);
        signOutButton.addEventListener("click", handleSignOutButtonClick);

        // 3. Initialize and make the API request.
        const authInstance = gapi.auth2.getAuthInstance();
        authInstance.isSignedIn.listen(observeSignedIn);
        observeSignedIn(authInstance.isSignedIn.get());
    }

    function observeSignedIn(isSignedIn) {
        const payload = {
            provider: "GAPI",
            gapi,
            isSignedIn
        };
        signInButton.disabled = isSignedIn;
        signOutButton.disabled = !isSignedIn;
        if (isSignedIn) {

            const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
            const userId = profile.getId();
            const name = profile.getName();
            payload.user = { id: userId, name };
            payload.tenant = { id: userId };
            window.basePath = `https://app.openteamspace.com/dev/${payload.tenant.id}/`;
            publish(config.bus.DEBUG, "Added window.basePath");
        } else {

            throw new Error("Signout not handled");

        }
        publish(config.bus.SIGNED_IN, payload);
    }

    function handleSignInButtonClick() {
        gapi.auth2.getAuthInstance().signIn({ prompt: "consent" });
    }

    function handleSignOutButtonClick() {
        gapi.auth2.getAuthInstance().signOut();
    }
}