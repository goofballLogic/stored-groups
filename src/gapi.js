import config from "./config.js";
const { API_KEY, DISCOVERY_DOCS, CLIENT_ID, SCOPES } = config.drive;

export function load(gapi, { signInButton }) {

    // 1. Load the JavaScript client library.
    gapi.load('client:auth2', onGAPILoaded);
    signInButton.addEventListener("click", onSignInClick);

    async function onGAPILoaded() {
        // 2. Initialize the JavaScript client library.
        try {
            gapi.client.init({
                'apiKey': API_KEY,
                'discoveryDocs': DISCOVERY_DOCS,
                'clientId': CLIENT_ID,
                'scope': SCOPES,
            });
            onGAPIInitialized();
        } catch (err) {
            console.error(err);
        }
    }

    function onGAPIInitialized() {
        // 3. Initialize and make the API request.
        gapi.auth2.getAuthInstance().isSignedIn.listen(observeSignedIn);
        observeSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
    }

    function observeSignedIn(x, y, z) {
        console.log(x, y, z);
    }

    function onSignInClick() {
        gapi.auth2.getAuthInstance().signIn();
    }
}

