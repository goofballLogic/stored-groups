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

const searchParam = (url, key) => decode(url.searchParams.get(key));

const required = (x, description) => {
    if(!x) throw new Error(`${description} was not specified`);
    return x;
}

export default function(url) {
    return {
        decode,
        encode,
        tenant: required(searchParam(url, "tenant"), "tenant"),
        data: searchParam(url, "data")
    };
}