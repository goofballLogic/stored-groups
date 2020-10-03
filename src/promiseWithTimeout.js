const timeout = 10000;

export default function promiseWithTimeout(what, promiseResolver) {
    return Promise.race([
        new Promise(promiseResolver),
        new Promise((_, reject) =>
            setTimeout(
                () => reject(`Timed out waiting for ${what}`),
                timeout
            )
        )
    ]);
}