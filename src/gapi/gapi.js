import config from "../config.js";
import "./getters.js";
import "./setters.js";
import { subscribe, publish } from "../bus.js";

const { API_KEY, DISCOVERY_DOCS, CLIENT_ID, SCOPES } = config.drive;

export function load(gapi) {

    subscribe(config.bus.GAPI.REQUEST_SIGN_IN, handleGAPISignInRequest);
    subscribe(config.bus.GAPI.REQUEST_SIGN_OUT, handleGAPISignOutRequest);

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
        if (isSignedIn) {

            const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
            const userId = profile.getId();
            const name = profile.getName();
            payload.user = { id: userId, name };
            payload.tenant = { id: userId };
            window.basePath = `https://app.openteamspace.com/dev/${payload.tenant.id}/`;
            publish(config.bus.DEBUG, "Added window.basePath");

        }
        publish(config.bus.SIGNED_IN, payload);
    }

    function handleGAPISignInRequest() {
        gapi.auth2.getAuthInstance().signIn({ prompt: "consent" });
    }

    function handleGAPISignOutRequest() {
        gapi.auth2.getAuthInstance().signOut();
    }
}