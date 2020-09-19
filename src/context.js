let fetched = null;

export default async function () {
    if (!fetched) {
        const res = await fetch("https://app.openteamspace.com/dev/context.jsonld");
        const json = await res.json();
        fetched = json["@context"];
    }
    return fetched;
}