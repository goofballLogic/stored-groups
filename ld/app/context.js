
const decode = x => x && atob(x);

const encode = x => x && btoa(x);

const searchParam = (url, key, isEncoded = true) => {
    try {
    return isEncoded
        ? decode(url.searchParams.get(key))
        : url.searchParams.get(key);
    } catch(err) {
        console.error(key, isEncoded);
        throw err;
    }
};

const required = (x, description) => {
    if(!x) throw new Error(`${description} was not specified`);
    return x;
}

const maybeSave = value =>
    value ? new Date(Number(value)) : null;

function buildTenantHomeURL() {
    const url = new URL(location.href);
    Array
        .from((new URL(location.href).searchParams).keys())
        .filter(x => x !== "tenant")
        .forEach(key => { url.searchParams.delete(key); });
    return url.toString();
}

export default function(url) {
    return {
        decode,
        encode,
        tenant: required(searchParam(url, "tenant"), "tenant"),
        tenantHomeURL: buildTenantHomeURL(),
        data: searchParam(url, "data"),
        mode: searchParam(url, "mode", false),
        save: maybeSave(searchParam(url, "save", false)),
        returnURL: searchParam(url, "returnURL"),
        vocabNamespace: "http://openteamspace.com/vocab#",
        choice: searchParam(url, "choice"),
        choicePath: searchParam(url, "choicePath", false)
    };
}