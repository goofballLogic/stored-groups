export async function fetchAndExpandObjects() {
    var objects = Array.from(arguments);
    return await Promise.all(objects.map(fetchAndExpandObject));
}

export async function fetchObjects() {
    var objects = Array.from(arguments);
    return await Promise.all(objects.map(fetchObject));
}

async function fetchObject(o) {
    const resp = await fetch(`${o}.jsonld`);
    return await resp.json();
}

async function fetchAndExpandObject(o) {
    const json = await fetchObject(o);
console.log(1, json);
    return jsonld.expand(json);
}