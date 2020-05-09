import { required } from "../lib/validation";
const agent = Symbol("API agent");

export default class ApiBrowser {

    constructor(args) {
        this[agent] = required(args.agent, "agnet", "API fetch agent");
    }

};
