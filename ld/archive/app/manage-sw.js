if (navigator.serviceWorker.controller) {

    const url = navigator.serviceWorker.controller.scriptURL;
    console.log('serviceWorker.controller', url);

} else {

    navigator.serviceWorker.register("/sw.js", { scope: './' }).then(registration => {

        console.log("Refresh to allow ServiceWorker to control this client");
        console.log("Registration scope: ", registration.scope);

    });

}

navigator.serviceWorker.addEventListener("controllerchange", () => {

    const scriptURL = navigator.serviceWorker.controller.scriptURL;
    console.log( "serviceWorker.onControllerchange", scriptURL);

});