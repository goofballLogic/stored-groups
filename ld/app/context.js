const decode = x => {

    if (!x) return x;
    x = decodeURIComponent(x);
    return atob(x);

}

const encode = x => {

    if (!x) return x;
    x = btoa(x);
    return encodeURIComponent(x);

}

const searchParam = (url, key, isEncoded = true) => isEncoded
    ? decode(url.searchParams.get(key))
    : url.searchParams.get(key);

const required = (x, description) => {
    if(!x) throw new Error(`${description} was not specified`);
    return x;
}

const maybeSave = value =>
    value ? new Date(Number(value)) : null;

export default function(url) {
    return {
        decode,
        encode,
        tenant: required(searchParam(url, "tenant"), "tenant"),
        data: searchParam(url, "data"),
        mode: searchParam(url, "mode", false),
        save: maybeSave(searchParam(url, "save", false))
    };
}