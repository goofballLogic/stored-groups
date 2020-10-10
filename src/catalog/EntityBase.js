export default class EntityBase {

    #spec;

    constructor(options) {
        this.#spec = options && options.spec;
    }

    extract(propName, defaultValue) {
        const spec = this.#spec;
        return (spec && propName in spec)
            ? spec[propName]
            : defaultValue;
    }

    get name() {
        return this.extract("name", "?");
    }

    get relativePath() {
        return this.extract("relativePath") || "";
    }
}
