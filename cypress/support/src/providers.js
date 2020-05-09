const providers = {
    "local-dev": {
        "tenant": "tenant-1",
        "href": "http://localhost:8080/client.html",
        "team name": "The Eggheads"
    }
};

export function configure(provider) {
    this.provider = providers[provider];
    if(!this.provider) throw new Error("Unknown provider");
}